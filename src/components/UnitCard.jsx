import React from 'react';
import { MachineRow } from './MachineRow';
import { evalMachineStatus } from '../services/factorySchema';

export function UnitCard({ unitMeta, machinesState, onTriggerAnomaly }) {
  let okCount = 0;
  let warnCount = 0;
  let critCount = 0;

  unitMeta.machines.forEach(mMeta => {
    const mState = machinesState[mMeta.id];
    if (mState) {
      const st = evalMachineStatus(mState.sensors, mState.acousticScore, mMeta);
      if (st === 'critical') critCount++;
      else if (st === 'warning') warnCount++;
      else okCount++;
    }
  });

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-medium)',
      borderRadius: '8px',
      marginBottom: '20px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Unit Header Bar */}
      <div style={{
        background: 'var(--bg-panel-header)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 20px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-header" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            {unitMeta.name}
          </span>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            [{unitMeta.location}]
          </span>
        </div>

        {/* Machine Status Counters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="scada-tag scada-tag-ok">
            {okCount} OK
          </span>
          {warnCount > 0 && (
            <span className="scada-tag scada-tag-warn">
              {warnCount} WARN
            </span>
          )}
          {critCount > 0 && (
            <span className="scada-tag scada-tag-crit">
              {critCount} CRIT
            </span>
          )}
        </div>
      </div>

      {/* Machines Stack */}
      <div style={{ padding: '14px' }}>
        {unitMeta.machines.map(mMeta => (
          <MachineRow
            key={mMeta.id}
            machineMeta={mMeta}
            machineState={machinesState[mMeta.id]}
            onTriggerAnomaly={onTriggerAnomaly}
          />
        ))}
      </div>
    </div>
  );
}
