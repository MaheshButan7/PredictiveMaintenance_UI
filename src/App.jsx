import React, { useState, useEffect, useRef } from 'react';
import { FACTORY_UNITS } from './services/factorySchema';
import { initializeFactoryState, tickSimulation } from './services/simulationEngine';
import { HeaderBar } from './components/HeaderBar';
import { UnitCard } from './components/UnitCard';
import { AlertsSidebar } from './components/AlertsSidebar';
import { AiChatbotModal } from './components/AiChatbotModal';

export function App() {
  const [simState, setSimState] = useState(() => initializeFactoryState());
  const [isSimulating, setIsSimulating] = useState(true);
  const [theme, setTheme] = useState('light');
  const pendingAnomalyMachineRef = useRef(null);

  // Synchronize document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Simulation tick loop (every 2000 ms)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const targetAnomaly = pendingAnomalyMachineRef.current;
      pendingAnomalyMachineRef.current = null; // reset flag

      setSimState(prev => tickSimulation(prev.machinesState, prev.alertLogs, targetAnomaly));
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
    setSimState(prev => ({
      ...prev,
      alertLogs: prev.alertLogs.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    }));
  };

  // Clear alerts feed
  const handleClearAlerts = () => {
    setSimState(prev => ({ ...prev, alertLogs: [] }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky SCADA Header Bar */}
      <HeaderBar
        factoryUnits={FACTORY_UNITS}
        machinesState={simState.machinesState}
        isSimulating={isSimulating}
        onToggleSim={() => setIsSimulating(!isSimulating)}
        onTriggerGlobalAnomaly={() => handleTriggerAnomaly()}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />

      {/* Main Single-Page Content Canvas */}
      <main className="scada-container">
        {/* Left/Center Column: 6 Production Units */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
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
              machinesState={simState.machinesState}
              onTriggerAnomaly={handleTriggerAnomaly}
            />
          ))}
        </div>

        {/* Right Column: Persistent Always-Visible Alerts Panel */}
        <div>
          <AlertsSidebar
            alerts={simState.alertLogs}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onClearAlerts={handleClearAlerts}
          />
        </div>
      </main>

      {/* SCADA AI Chatbot Assistant Floating Modal */}
      <AiChatbotModal
        factoryUnits={FACTORY_UNITS}
        machinesState={simState.machinesState}
        alertLogs={simState.alertLogs}
      />
    </div>
  );
}

export default App;
