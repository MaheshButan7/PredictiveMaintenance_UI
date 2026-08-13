import React, { useState, useEffect, useRef } from 'react';
import { FACTORY_UNITS } from './services/factorySchema';
import { initializeFactoryState, tickSimulation } from './services/simulationEngine';
import { HeaderBar } from './components/HeaderBar';
import { UnitCard } from './components/UnitCard';
import { AlertsSidebar } from './components/AlertsSidebar';

export function App() {
  const [machinesState, setMachinesState] = useState(() => initializeFactoryState().machinesState);
  const [alertLogs, setAlertLogs] = useState(() => initializeFactoryState().alertLogs);
  const [isSimulating, setIsSimulating] = useState(true);
  const pendingAnomalyMachineRef = useRef(null);

  // Simulation tick loop (every 2000 ms)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const targetAnomaly = pendingAnomalyMachineRef.current;
      pendingAnomalyMachineRef.current = null; // reset flag

      setMachinesState(prevMachines => {
        let nextMachines = prevMachines;

        setAlertLogs(prevAlerts => {
          const result = tickSimulation(prevMachines, prevAlerts, targetAnomaly);
          nextMachines = result.machinesState;
          return result.alertLogs;
        });

        return nextMachines;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Trigger manual anomaly on specific machine or random machine
  const handleTriggerAnomaly = (machineId = null) => {
    if (machineId) {
      pendingAnomalyMachineRef.current = machineId;
    } else {
      const allMachineIds = FACTORY_UNITS.flatMap(u => u.machines.map(m => m.id));
      const randomId = allMachineIds[Math.floor(Math.random() * allMachineIds.length)];
      pendingAnomalyMachineRef.current = randomId;
    }
  };

  // Acknowledge single alert log
  const handleAcknowledgeAlert = (alertId) => {
    setAlertLogs(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  // Clear alerts feed
  const handleClearAlerts = () => {
    setAlertLogs([]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky SCADA Header Bar */}
      <HeaderBar
        factoryUnits={FACTORY_UNITS}
        machinesState={machinesState}
        isSimulating={isSimulating}
        onToggleSim={() => setIsSimulating(!isSimulating)}
        onTriggerGlobalAnomaly={() => handleTriggerAnomaly()}
      />

      {/* Main Single-Page Content Canvas */}
      <main className="scada-container">
        {/* Left/Center Column: 6 Production Units */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            padding: '4px 2px'
          }}>
            <h2 className="font-header" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              FACTORY FLOOR UNIT GRID (6 UNITS • 12 MACHINES)
            </h2>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click any machine row to expand telemetry & acoustic spectrum in-place
            </span>
          </div>

          {FACTORY_UNITS.map(unit => (
            <UnitCard
              key={unit.id}
              unitMeta={unit}
              machinesState={machinesState}
              onTriggerAnomaly={handleTriggerAnomaly}
            />
          ))}
        </div>

        {/* Right Column: Persistent Always-Visible Alerts Panel */}
        <div>
          <AlertsSidebar
            alerts={alertLogs}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onClearAlerts={handleClearAlerts}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
