import { FACTORY_UNITS, evalSensorStatus, evalAcousticStatus, evalMachineStatus } from './factorySchema';

const HISTORY_LIMIT = 30; // 30 history points for sparklines/oscilloscopes

export function initializeFactoryState() {
  const machinesState = {};
  const alertLogs = [];

  FACTORY_UNITS.forEach(unit => {
    unit.machines.forEach(machine => {
      const sensorValues = {};
      const sensorHistory = {};

      machine.sensors.forEach(sensor => {
        const norm = sensor.norm;
        sensorValues[sensor.id] = norm;
        sensorHistory[sensor.id] = Array(HISTORY_LIMIT).fill(norm);
      });

      const initialAcoustic = 8.5 + Math.random() * 4.0; // 8 - 12% nominal baseline

      machinesState[machine.id] = {
        unitId: unit.id,
        unitName: unit.name,
        machineId: machine.id,
        machineName: machine.name,
        machineType: machine.type,
        sensors: sensorValues,
        history: sensorHistory,
        acousticScore: initialAcoustic,
        acousticHistory: Array(HISTORY_LIMIT).fill(initialAcoustic),
        anomalyState: null, // null or { sensorId, currentStep, totalSteps, direction, maxSeverity }
        previousStatus: 'ok'
      };
    });
  });

  return { machinesState, alertLogs };
}

// Tick simulation step
export function tickSimulation(currentState, alertLogs, activeAnomalyTarget = null) {
  const nextState = { ...currentState };
  const newAlerts = [...alertLogs];
  const now = new Date();
  const timestampStr = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(now.getMilliseconds() / 100);

  // Random chance to auto-trigger a new anomaly event if none active
  let triggerRandomAnomaly = Math.random() < 0.12;

  Object.keys(nextState).forEach(mId => {
    const mData = { ...nextState[mId] };
    const mMeta = findMachineMeta(mId);
    if (!mMeta) return;

    const nextSensors = { ...mData.sensors };
    const nextHistory = { ...mData.history };
    let nextAcoustic = mData.acousticScore;
    let anomalyState = mData.anomalyState ? { ...mData.anomalyState } : null;

    // Check if user manually triggered an anomaly on this machine
    if (activeAnomalyTarget === mId && !anomalyState) {
      const pickAcoustic = Math.random() < 0.35;
      const targetSensorId = pickAcoustic ? 'acoustic' : mMeta.sensors[Math.floor(Math.random() * mMeta.sensors.length)].id;
      anomalyState = {
        sensorId: targetSensorId,
        currentStep: 0,
        totalSteps: 18,
        phase: 'rising' // 'rising' -> 'peak' -> 'recovering'
      };
    } else if (triggerRandomAnomaly && !anomalyState && Math.random() < 0.15) {
      triggerRandomAnomaly = false;
      const pickAcoustic = Math.random() < 0.3;
      const targetSensorId = pickAcoustic ? 'acoustic' : mMeta.sensors[Math.floor(Math.random() * mMeta.sensors.length)].id;
      anomalyState = {
        sensorId: targetSensorId,
        currentStep: 0,
        totalSteps: 20,
        phase: 'rising'
      };
    }

    // Process Sensors
    mMeta.sensors.forEach(sMeta => {
      let val = nextSensors[sMeta.id];
      const norm = sMeta.norm;
      
      // Base Ornstein-Uhlenbeck mean-reverting jitter
      const driftSpeed = 0.15;
      const noise = (Math.random() - 0.5) * (sMeta.max - sMeta.min) * 0.015;
      val = val + driftSpeed * (norm - val) + noise;

      // Apply active anomaly drift if targeted
      if (anomalyState && anomalyState.sensorId === sMeta.id) {
        const progress = anomalyState.currentStep / anomalyState.totalSteps;
        let targetCritVal = sMeta.critHigh !== undefined ? sMeta.critHigh * 1.05 : sMeta.critLow * 0.95;

        if (anomalyState.phase === 'rising') {
          val = val + (targetCritVal - val) * 0.22;
        } else if (anomalyState.phase === 'recovering') {
          val = val + (norm - val) * 0.25;
        }
      }

      // Clamp within min/max bounds
      val = Math.max(sMeta.min, Math.min(sMeta.max, val));
      nextSensors[sMeta.id] = val;

      // Push to history
      const hist = [...(nextHistory[sMeta.id] || [])];
      hist.push(val);
      if (hist.length > HISTORY_LIMIT) hist.shift();
      nextHistory[sMeta.id] = hist;
    });

    // Process Acoustic Score (0-100%)
    const acousticNorm = 10.0;
    const acousticNoise = (Math.random() - 0.5) * 1.8;
    nextAcoustic = nextAcoustic + 0.15 * (acousticNorm - nextAcoustic) + acousticNoise;

    if (anomalyState && anomalyState.sensorId === 'acoustic') {
      if (anomalyState.phase === 'rising') {
        nextAcoustic = nextAcoustic + (85 - nextAcoustic) * 0.22;
      } else if (anomalyState.phase === 'recovering') {
        nextAcoustic = nextAcoustic + (acousticNorm - nextAcoustic) * 0.25;
      }
    }
    nextAcoustic = Math.max(0, Math.min(100, nextAcoustic));
    const acousticHist = [...(mData.acousticHistory || [])];
    acousticHist.push(nextAcoustic);
    if (acousticHist.length > HISTORY_LIMIT) acousticHist.shift();

    // Advance Anomaly State Machine
    if (anomalyState) {
      anomalyState.currentStep += 1;
      if (anomalyState.phase === 'rising' && anomalyState.currentStep >= 10) {
        anomalyState.phase = 'recovering';
      }
      if (anomalyState.currentStep >= anomalyState.totalSteps) {
        anomalyState = null;
      }
    }

    // Evaluate machine status
    const currentMachineStatus = evalMachineStatus(nextSensors, nextAcoustic, mMeta);

    // Alert Stream Logging on Status Escalation / De-escalation
    if (currentMachineStatus !== mData.previousStatus) {
      if (currentMachineStatus === 'warning' || currentMachineStatus === 'critical') {
        // Find triggering sensor or acoustic
        let triggerName = 'Acoustic Anomaly';
        let triggerVal = `${nextAcoustic.toFixed(1)}%`;

        if (evalAcousticStatus(nextAcoustic) === currentMachineStatus) {
          triggerName = 'Acoustic Sensor';
          triggerVal = `${nextAcoustic.toFixed(1)}% Anomaly Score`;
        } else {
          for (const sMeta of mMeta.sensors) {
            const st = evalSensorStatus(sMeta, nextSensors[sMeta.id]);
            if (st === currentMachineStatus) {
              triggerName = sMeta.name;
              triggerVal = `${nextSensors[sMeta.id].toFixed(sMeta.precision)} ${sMeta.unit}`;
              break;
            }
          }
        }

        const diagMessage = mMeta.acousticDiagnostics[currentMachineStatus] || "Telemetry drift beyond operational baseline.";

        newAlerts.unshift({
          id: `ALT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          timestamp: timestampStr,
          unitId: mData.unitId,
          unitName: mData.unitName,
          machineId: mData.machineId,
          machineName: mData.machineName,
          machineType: mData.machineType,
          sensorName: triggerName,
          value: triggerVal,
          severity: currentMachineStatus,
          message: diagMessage,
          acknowledged: false
        });
      } else if (currentMachineStatus === 'ok' && (mData.previousStatus === 'warning' || mData.previousStatus === 'critical')) {
        newAlerts.unshift({
          id: `ALT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          timestamp: timestampStr,
          unitId: mData.unitId,
          unitName: mData.unitName,
          machineId: mData.machineId,
          machineName: mData.machineName,
          machineType: mData.machineType,
          sensorName: 'Machine Health',
          value: 'Nominal',
          severity: 'ok',
          message: `Machine restored to nominal baseline status.`,
          acknowledged: false
        });
      }
    }

    nextState[mId] = {
      ...mData,
      sensors: nextSensors,
      history: nextHistory,
      acousticScore: nextAcoustic,
      acousticHistory: acousticHist,
      anomalyState,
      previousStatus: currentMachineStatus
    };
  });

  // Cap alert log length to 80 recent items
  const cappedAlerts = newAlerts.slice(0, 80);

  return { machinesState: nextState, alertLogs: cappedAlerts };
}

function findMachineMeta(mId) {
  for (const unit of FACTORY_UNITS) {
    for (const m of unit.machines) {
      if (m.id === mId) return m;
    }
  }
  return null;
}
