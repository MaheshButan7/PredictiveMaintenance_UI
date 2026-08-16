import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { evalMachineStatus } from '../services/factorySchema';
import companyLogo from '../assets/company_logo.webp';

export function HeaderBar({
  factoryUnits,
  machinesState,
  isSimulating,
  onToggleSim,
  onTriggerGlobalAnomaly,
  theme,
  onToggleTheme
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    return () => clearInterval(timer);
  }, []);

  let okCount = 0;
  let warnCount = 0;
  let critCount = 0;

  factoryUnits.forEach(u => {
    u.machines.forEach(m => {
      const mState = machinesState[m.id];
      if (mState) {
        const st = evalMachineStatus(mState.sensors, mState.acousticScore, m);
        if (st === 'critical') critCount++;
        else if (st === 'warning') warnCount++;
        else okCount++;
      }
    });
  });

  const rawHealth = 100 - (warnCount * 8) - (critCount * 25);
  const plantHealthPct = Math.max(0, Math.min(100, rawHealth));
  const healthColor = plantHealthPct > 80 ? '#16a34a' : plantHealthPct > 50 ? '#d97706' : '#dc2626';

  return (
    <header className="scada-header">
      {/* Station Title & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={companyLogo}
            alt="Watchtower Logo"
            style={{
              height: '36px',
              width: 'auto',
              maxHeight: '36px',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
          <div>
            <h1 className="font-header" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
              WATCHTOWER
            </h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="scada-led scada-led-ok" />
              <span>SYSTEM ONLINE</span>
              <span>|</span>
              <span>PREDICTIVE MAINTENANCE</span>
              <span>|</span>
              <span>6 UNITS / 12 MACHINES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Metrics: Plant Health Bar & Status Counters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Plant Health Bar */}
        <div className="scada-lcd-box" style={{ padding: '6px 14px', minWidth: '180px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Plant Health Index
            </span>
            <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: healthColor }}>
              {plantHealthPct.toFixed(0)}%
            </span>
          </div>
          <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${plantHealthPct}%`,
              backgroundColor: healthColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Machine Status Counters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="scada-tag scada-tag-ok">
            {okCount} OK
          </span>
          <span className={`scada-tag ${warnCount > 0 ? 'scada-tag-warn' : ''}`} style={{ opacity: warnCount === 0 ? 0.4 : 1 }}>
            {warnCount} WARN
          </span>
          <span className={`scada-tag ${critCount > 0 ? 'scada-tag-crit' : ''}`} style={{ opacity: critCount === 0 ? 0.4 : 1 }}>
            {critCount} CRIT
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Switcher & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Light / Dark Theme Switcher Button */}
        <button
          className="scada-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'SCADA Dark Theme' : 'Light Theme'}`}
        >
          {theme === 'light' ? <><Moon size={14} /> DARK MODE</> : <><Sun size={14} /> LIGHT MODE</>}
        </button>

        {/* Digital Clock */}
        <div className="scada-lcd-box" style={{ padding: '4px 10px' }}>
          <span className="font-mono" style={{ fontSize: '0.88rem', color: 'var(--acoustic-cyan)', fontWeight: 700 }}>
            {timeStr || '00:00:00'}
          </span>
        </div>
      </div>
    </header>
  );
}
