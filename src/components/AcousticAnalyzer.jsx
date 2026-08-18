import React from 'react';
import { Activity, Radio, Volume2, ShieldAlert } from 'lucide-react';
import { evalAcousticStatus } from '../services/factorySchema';

// Logarithmic mapping helper (20 Hz to 20,000 Hz)
const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const MIN_LOG = Math.log10(MIN_FREQ);
const MAX_LOG = Math.log10(MAX_FREQ);

function getLogPct(freq) {
  const fLog = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq)));
  return ((fLog - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100;
}

// Single Unified Y-Axis Mapping Function (0 dB to 100 dB SPL)
// Value 100 dB -> 0% (top), Value 0 dB -> 100% (bottom)
const DB_MIN = 0;
const DB_MAX = 100;

function getYPct(dbValue) {
  const clamped = Math.max(DB_MIN, Math.min(DB_MAX, dbValue));
  return (1 - clamped / DB_MAX) * 100;
}

const LOG_TICKS = [
  { freq: 20, label: '20Hz' },
  { freq: 100, label: '100Hz' },
  { freq: 500, label: '500Hz' },
  { freq: 2000, label: '2kHz' },
  { freq: 8000, label: '8kHz' },
  { freq: 20000, label: '20kHz' },
];

const Y_DB_TICKS = [100, 75, 50, 25, 0];

// Smooth cardinal curve interpolation generator for SVG path
function createSmoothPath(points) {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function AcousticAnalyzer({ machineMeta, acousticScore = 10.0 }) {
  const status = evalAcousticStatus(acousticScore);

  const statusColors = {
    ok: '#06b6d4',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  const currentColor = statusColors[status];
  const diagnosticText = machineMeta.acousticDiagnostics[status] || "Acoustic signature nominal.";

  // Clean baseline text without duplicated "Baseline" label (BUG 2 FIX)
  const cleanBaselineText = (machineMeta.acousticBaseline || '').replace(/^Baseline\s*/i, '');

  // Logarithmically target machine anomaly frequency centers (BUG 4 FIX)
  let targetAnomalyFreq = 2400; // Default Mid-band
  if (machineMeta.type?.includes('Valve') || machineMeta.type?.includes('Pump')) {
    targetAnomalyFreq = 12500; // Ultrasonic band ~ 12.5 kHz
  } else if (machineMeta.type?.includes('Motor') || machineMeta.type?.includes('Compressor')) {
    targetAnomalyFreq = 150; // Low band ~ 150 Hz
  }

  // Generate 64 logarithmically spaced points for exact data-driven curve resolution
  const numPoints = 64;
  const livePoints = [];
  const baselinePoints = [];

  let maxPt = { freq: MIN_FREQ, liveDb: 0, x: 0, y: 100 };

  for (let i = 0; i < numPoints; i++) {
    const fLog = MIN_LOG + (i / (numPoints - 1)) * (MAX_LOG - MIN_LOG);
    const freq = Math.pow(10, fLog);
    const xPct = getLogPct(freq);

    // Baseline envelope curve (0-100 dB scale)
    const baseDb = 25 + 18 * Math.sin((i / (numPoints - 1)) * Math.PI) + 3 * Math.sin(i * 0.4);

    // Gaussian spectral anomaly spike centered precisely on target log frequency
    let anomalyBoost = 0;
    if (acousticScore > 12) {
      const severity = (acousticScore - 12) / 88;
      const deltaLogPct = xPct - getLogPct(targetAnomalyFreq);
      const sigmaPct = 7.5; // Log-scale spread width
      const maxSpikeDb = 58 * severity;
      anomalyBoost = maxSpikeDb * Math.exp(-(deltaLogPct * deltaLogPct) / (2 * sigmaPct * sigmaPct));
    }

    const liveDb = Math.min(96, Math.max(6, baseDb + anomalyBoost + Math.sin(i * 1.5) * 2.5));
    const clampedBaseDb = Math.min(92, Math.max(6, baseDb));

    // SVG coordinates mapped strictly using getYPct (BUG 1 FIX)
    const yLive = getYPct(liveDb);
    const yBase = getYPct(clampedBaseDb);

    const ptLive = { x: xPct, y: yLive, freq, liveDb };
    const ptBase = { x: xPct, y: yBase, freq, baseDb: clampedBaseDb };

    livePoints.push(ptLive);
    baselinePoints.push(ptBase);

    if (liveDb > maxPt.liveDb) {
      maxPt = ptLive;
    }
  }

  // Construct SVG paths
  const liveCurveD = createSmoothPath(livePoints);
  const liveAreaD = `${liveCurveD} L 100 100 L 0 100 Z`;
  const baselineCurveD = createSmoothPath(baselinePoints);

  const peakFreqStr = maxPt.freq >= 1000 ? `${(maxPt.freq / 1000).toFixed(1)} kHz` : `${Math.round(maxPt.freq)} Hz`;
  const peakDbStr = `${maxPt.liveDb.toFixed(1)} dB`;

  // Elevated band classification
  let elevatedBandLabel = 'Nominal / Balanced';
  if (status !== 'ok' || maxPt.liveDb > 60) {
    if (maxPt.freq < 300) {
      elevatedBandLabel = 'Low Band (Unbalance / Loosening)';
    } else if (maxPt.freq < 4000) {
      elevatedBandLabel = 'Mid Band (Bearing / Gear Friction)';
    } else {
      elevatedBandLabel = 'Ultrasonic Band (Cavitation / Leakage)';
    }
  }

  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-medium)',
      borderRadius: '8px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(6, 182, 212, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={16} color="var(--acoustic-cyan)" />
          </div>
          <div>
            <div className="font-header" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              ANALOG ACOUSTIC FREQUENCY SPECTRUM (FFT WAVEFORM)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Continuous Analog Transducer Signal • Frequency Domain Envelope
            </div>
          </div>
        </div>

        {/* Clean Baseline Readout (BUG 2 & 3 FIX: No duplicated Baseline word, No leftover scalar % badge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            BASELINE: <strong>{cleanBaselineText}</strong>
          </span>
        </div>
      </div>

      {/* Main FFT Display Canvas & Readout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '18px',
        alignItems: 'stretch',
        background: '#0b1329',
        border: '1px solid #1e293b',
        padding: '16px',
        borderRadius: '6px',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
      }}>
        {/* Left: Waveform Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Top Axis Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
            <span>LOGARITHMIC FREQUENCY AXIS (20Hz - 20kHz)</span>
            <span>AMPLITUDE RANGE: 0 - 100 dB SPL</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', height: '170px', position: 'relative' }}>
            {/* Y-Axis dB Scale Ticks - Mapped precisely with getYPct (BUG 1 FIX) */}
            <div style={{
              position: 'relative',
              width: '45px',
              userSelect: 'none'
            }}>
              {Y_DB_TICKS.map(db => {
                const topPct = getYPct(db);
                const translateY = db === 100 ? '0%' : db === 0 ? '-100%' : '-50%';
                return (
                  <span
                    key={db}
                    style={{
                      position: 'absolute',
                      top: `${topPct}%`,
                      right: '8px',
                      transform: `translateY(${translateY})`,
                      fontSize: '0.65rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1
                    }}
                  >
                    {db} dB
                  </span>
                );
              })}
            </div>

            {/* Canvas Display Area */}
            <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid #334155', borderLeft: '1px solid #334155', overflow: 'hidden' }}>
              {/* Horizontal Grid lines - Mapped precisely with getYPct (BUG 1 FIX) */}
              {Y_DB_TICKS.map(db => (
                <div
                  key={db}
                  style={{
                    position: 'absolute',
                    top: `${getYPct(db)}%`,
                    left: 0,
                    right: 0,
                    borderTop: '1px stroke rgba(51, 65, 85, 0.35)',
                    borderStyle: db === 0 || db === 100 ? 'solid' : 'dashed',
                    borderWidth: '1px 0 0 0',
                    borderColor: 'rgba(51, 65, 85, 0.35)',
                    pointerEvents: 'none'
                  }}
                />
              ))}

              {/* Vertical Log Grid Lines */}
              {LOG_TICKS.map(t => (
                <div
                  key={t.freq}
                  style={{
                    position: 'absolute',
                    left: `${getLogPct(t.freq)}%`,
                    top: 0,
                    bottom: 0,
                    borderLeft: '1px dashed rgba(51, 65, 85, 0.35)'
                  }}
                />
              ))}

              {/* SVG Smooth Spectrum Waveform Canvas */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs>
                  {/* Waveform Fill Gradient */}
                  <linearGradient id="spectrum-fill-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentColor} stopOpacity="0.4" />
                    <stop offset="60%" stopColor={currentColor} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={currentColor} stopOpacity="0.0" />
                  </linearGradient>

                  {/* Glow filter */}
                  <filter id="spectrum-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Filled Waveform Area */}
                <path d={liveAreaD} fill="url(#spectrum-fill-grad)" />

                {/* Baseline Envelope Curve (Dashed line) */}
                <path
                  d={baselineCurveD}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.55)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />

                {/* Live Spectrum Waveform Curve */}
                <path
                  d={liveCurveD}
                  fill="none"
                  stroke={currentColor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#spectrum-glow)"
                />
              </svg>

              {/* Dynamic Peak Marker Point - Positioned via getYPct (BUG 1 FIX) */}
              <div style={{
                position: 'absolute',
                left: `${maxPt.x}%`,
                top: `${maxPt.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: currentColor,
                  boxShadow: `0 0 12px ${currentColor}`,
                  border: '2px solid #ffffff'
                }} />
                {/* Floating Callout Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#020617',
                  border: `1px solid ${currentColor}`,
                  color: currentColor,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                }}>
                  PEAK: {peakFreqStr} ({peakDbStr})
                </div>
              </div>
            </div>
          </div>

          {/* X-Axis True Logarithmic Frequency Labels */}
          <div style={{ position: 'relative', height: '18px', marginLeft: '55px', userSelect: 'none' }}>
            {LOG_TICKS.map(t => (
              <span
                key={t.freq}
                style={{
                  position: 'absolute',
                  left: `${getLogPct(t.freq)}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Telemetry Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '10px',
          borderLeft: '1px solid #1e293b',
          paddingLeft: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-header)', letterSpacing: '0.05em', fontWeight: 700 }}>
              SPECTRAL TELEMETRY
            </span>
            <Volume2 size={16} color={currentColor} />
          </div>

          {/* Key Spectral Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="scada-lcd-box" style={{ background: '#020617', borderColor: '#1e293b', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Dominant Peak Freq</span>
              <span className="font-mono" style={{ fontSize: '1.05rem', color: currentColor, fontWeight: 700 }}>
                {peakFreqStr}
              </span>
            </div>

            <div className="scada-lcd-box" style={{ background: '#020617', borderColor: '#1e293b', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Peak Amplitude</span>
              <span className="font-mono" style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>
                {peakDbStr}
              </span>
            </div>

            <div className="scada-lcd-box" style={{ background: '#020617', borderColor: '#1e293b', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Elevated Frequency Band</span>
              <span className="font-sans" style={{ fontSize: '0.75rem', color: status !== 'ok' ? currentColor : '#cbd5e1', fontWeight: 600, marginTop: '2px' }}>
                {elevatedBandLabel}
              </span>
            </div>
          </div>

          {/* Baseline Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '0', borderTop: '2px dashed rgba(148, 163, 184, 0.7)' }} />
              <span>Nominal Baseline Envelope</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: currentColor, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '2px', backgroundColor: currentColor }} />
              <span>Live Acoustic Spectrum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Fault Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: `rgba(${status === 'ok' ? '6, 182, 212' : status === 'warning' ? '245, 158, 11' : '239, 68, 68'}, 0.08)`,
        borderLeft: `4px solid ${currentColor}`,
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)'
      }}>
        {status !== 'ok' ? <ShieldAlert size={16} color={currentColor} style={{ flexShrink: 0 }} /> : <Activity size={16} color={currentColor} style={{ flexShrink: 0 }} />}
        <span><strong>ACOUSTIC DIAGNOSTIC:</strong> {diagnosticText}</span>
      </div>
    </div>
  );
}



