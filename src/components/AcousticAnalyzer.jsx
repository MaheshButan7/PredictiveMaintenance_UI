import React from 'react';
import { Activity, Radio, Volume2 } from 'lucide-react';
import { evalAcousticStatus } from '../services/factorySchema';

export function AcousticAnalyzer({ machineMeta, acousticScore = 10.0, acousticHistory = [] }) {
  const status = evalAcousticStatus(acousticScore);

  const statusColors = {
    ok: '#0284c7',
    warning: '#d97706',
    critical: '#dc2626'
  };

  const currentColor = statusColors[status];
  const diagnosticText = machineMeta.acousticDiagnostics[status] || "Acoustic signature nominal.";

  const numBands = 24;
  const bands = Array.from({ length: numBands }, (_, i) => {
    const centerFactor = Math.sin((i / (numBands - 1)) * Math.PI);
    const baseAmp = 12 + centerFactor * 40;
    const anomalyAmp = (acousticScore / 100) * (35 + Math.random() * 45);
    const val = Math.min(100, Math.max(4, baseAmp + anomalyAmp + (Math.random() - 0.5) * 12));
    return val;
  });

  const splVal = (58 + (acousticScore / 100) * 34).toFixed(1);
  const kurtosisVal = (3.0 + (acousticScore / 100) * 8.5).toFixed(2);

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: '#ffffff',
      border: '1px solid var(--border-medium)',
      borderRadius: '6px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="var(--acoustic-cyan)" className="scada-led-ok" />
          <span className="font-header" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
            ACOUSTIC ANOMALY MONITOR & FFT SPECTRUM ANALYZER
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            BASELINE: {machineMeta.acousticBaseline}
          </span>
          <span className="scada-tag" style={{
            background: `rgba(${status === 'ok' ? '2, 132, 199' : status === 'warning' ? '217, 119, 6' : '220, 38, 38'}, 0.1)`,
            color: currentColor,
            borderColor: currentColor
          }}>
            ANOMALY SCORE: {acousticScore.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main FFT Display Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 260px',
        gap: '18px',
        alignItems: 'center',
        background: '#f8fafc',
        border: '1px solid var(--border-subtle)',
        padding: '14px',
        borderRadius: '4px'
      }}>
        {/* Left: Spectrum Screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '8px', height: '75px', alignItems: 'stretch' }}>
            {/* DB Scale ticks */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              <span>0dB</span>
              <span>30dB</span>
              <span>60dB</span>
            </div>

            {/* Bars container */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '4px', borderBottom: '1px solid #cbd5e1' }}>
              {bands.map((barVal, idx) => {
                const barColor = barVal > 75 ? '#dc2626' : barVal > 45 ? '#d97706' : '#0284c7';
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${barVal}%`,
                      backgroundColor: barColor,
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.15s ease-out'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* X Axis Frequency Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)', paddingLeft: '36px' }}>
            <span>20Hz</span>
            <span>250Hz</span>
            <span>1kHz</span>
            <span>4kHz</span>
            <span>12kHz</span>
            <span>20kHz</span>
          </div>
        </div>

        {/* Right: Acoustic Metrics Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-header)' }}>
              ACOUSTIC TELEMETRY
            </span>
            <Volume2 size={15} color={currentColor} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="scada-lcd-box">
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sound Pressure</span>
              <span className="font-mono" style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{splVal} dBA</span>
            </div>
            <div className="scada-lcd-box">
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Kurtosis</span>
              <span className="font-mono" style={{ fontSize: '0.95rem', color: kurtosisVal > 5 ? '#d97706' : '#0f172a', fontWeight: 700 }}>{kurtosisVal}</span>
            </div>
          </div>

          {/* Score Meter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>Deviation Meter</span>
              <span style={{ fontWeight: 700, color: currentColor }}>{acousticScore.toFixed(1)}%</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, acousticScore))}%`,
                backgroundColor: currentColor,
                transition: 'width 0.25s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Fault Code Line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: `rgba(${status === 'ok' ? '2, 132, 199' : status === 'warning' ? '217, 119, 6' : '220, 38, 38'}, 0.08)`,
        borderLeft: `4px solid ${currentColor}`,
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)'
      }}>
        <Activity size={16} color={currentColor} style={{ flexShrink: 0 }} />
        <span><strong>ACOUSTIC DIAGNOSTIC:</strong> {diagnosticText}</span>
      </div>
    </div>
  );
}
