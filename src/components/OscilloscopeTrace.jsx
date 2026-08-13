import React from 'react';
import { evalSensorStatus } from '../services/factorySchema';

export function OscilloscopeTrace({ sensorMeta, history = [] }) {
  const { name, unit, min, max, warnHigh, critHigh, warnLow, critLow, precision = 1 } = sensorMeta;
  const currentVal = history.length > 0 ? history[history.length - 1] : sensorMeta.norm;
  const status = evalSensorStatus(sensorMeta, currentVal);

  const width = 290;
  const height = 95;
  const padding = 12;

  const statusColors = {
    ok: '#16a34a',
    warning: '#d97706',
    critical: '#dc2626'
  };
  const traceColor = statusColors[status];

  const pointsCount = history.length;
  const points = history.map((val, idx) => {
    const x = padding + (idx / Math.max(1, pointsCount - 1)) * (width - 2 * padding);
    const clamped = Math.max(min, Math.min(max, val));
    const normalizedY = (clamped - min) / (max - min);
    const y = (height - padding) - normalizedY * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const getYForVal = (val) => {
    const clamped = Math.max(min, Math.min(max, val));
    const normalizedY = (clamped - min) / (max - min);
    return (height - padding) - normalizedY * (height - 2 * padding);
  };

  return (
    <div className="instrument-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="font-header" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {name} [TREND TRACE]
        </span>
        <span className="font-mono" style={{ fontSize: '0.8rem', color: traceColor, fontWeight: 700 }}>
          {currentVal.toFixed(precision)} {unit}
        </span>
      </div>

      {/* Scope Box Window */}
      <div style={{
        background: '#0f172a',
        border: '1px solid var(--border-medium)',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Scope Header Status */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '8px',
          right: '8px',
          display: 'flex',
          justify: 'space-between',
          fontSize: '0.62rem',
          fontFamily: 'var(--font-mono)',
          color: '#64748b',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          <span>SCALE: AUTO</span>
          <span>SAMPLE: 2.0s</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: `${height}px`, display: 'block' }}>
          <defs>
            <pattern id={`scope-grid-light-${sensorMeta.id}`} width="29" height="19" patternUnits="userSpaceOnUse">
              <path d="M 29 0 L 0 0 0 19" fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Graticule Grid */}
          <rect width={width} height={height} fill={`url(#scope-grid-light-${sensorMeta.id})`} />

          {/* Threshold Lines */}
          {warnHigh !== undefined && (
            <line x1={padding} y1={getYForVal(warnHigh)} x2={width - padding} y2={getYForVal(warnHigh)} stroke="rgba(245, 158, 11, 0.7)" strokeDasharray="3 3" strokeWidth="1" />
          )}
          {critHigh !== undefined && (
            <line x1={padding} y1={getYForVal(critHigh)} x2={width - padding} y2={getYForVal(critHigh)} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" strokeWidth="1" />
          )}
          {warnLow !== undefined && (
            <line x1={padding} y1={getYForVal(warnLow)} x2={width - padding} y2={getYForVal(warnLow)} stroke="rgba(245, 158, 11, 0.7)" strokeDasharray="3 3" strokeWidth="1" />
          )}
          {critLow !== undefined && (
            <line x1={padding} y1={getYForVal(critLow)} x2={width - padding} y2={getYForVal(critLow)} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" strokeWidth="1" />
          )}

          {/* Trace Polyline */}
          {points && (
            <polyline
              fill="none"
              stroke={traceColor === '#16a34a' ? '#4ade80' : traceColor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
          )}

          {/* Current Point Dot */}
          {history.length > 0 && (() => {
            const lastX = width - padding;
            const lastY = getYForVal(currentVal);
            return (
              <g>
                <circle cx={lastX} cy={lastY} r="3.5" fill="#ffffff" stroke={traceColor} strokeWidth="2" />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
