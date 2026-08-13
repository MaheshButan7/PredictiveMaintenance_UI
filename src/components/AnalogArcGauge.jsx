import React from 'react';
import { evalSensorStatus } from '../services/factorySchema';

export function AnalogArcGauge({ sensorMeta, value }) {
  const { name, unit, min, max, warnHigh, critHigh, warnLow, critLow, precision = 1 } = sensorMeta;
  const currentVal = value !== undefined ? value : sensorMeta.norm;
  const status = evalSensorStatus(sensorMeta, currentVal);

  const clampedVal = Math.max(min, Math.min(max, currentVal));
  const pct = (clampedVal - min) / (max - min);

  // Sweep range: -110 deg (min) to +110 deg (max)
  const startAngle = -110;
  const sweepAngle = 220;
  const needleAngle = startAngle + pct * sweepAngle;

  const cx = 100;
  const cy = 90;
  const r = 66;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x, y, radius, startA, endA) => {
    const start = polarToCartesian(x, y, radius, endA);
    const end = polarToCartesian(x, y, radius, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Threshold math
  const warnPctHigh = warnHigh !== undefined ? (warnHigh - min) / (max - min) : 1;
  const critPctHigh = critHigh !== undefined ? (critHigh - min) / (max - min) : 1;
  const warnPctLow = warnLow !== undefined ? (warnLow - min) / (max - min) : 0;
  const critPctLow = critLow !== undefined ? (critLow - min) / (max - min) : 0;

  const warnAngleHigh = startAngle + warnPctHigh * sweepAngle;
  const critAngleHigh = startAngle + critPctHigh * sweepAngle;
  const warnAngleLow = startAngle + warnPctLow * sweepAngle;
  const critAngleLow = startAngle + critPctLow * sweepAngle;

  const statusColors = {
    ok: '#16a34a',
    warning: '#d97706',
    critical: '#dc2626'
  };

  const needleColor = statusColors[status];

  return (
    <div className="instrument-card">
      {/* Label Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="font-header" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {name}
        </span>
        <span className={`scada-tag scada-tag-${status}`}>
          {status}
        </span>
      </div>

      {/* Light Dial Housing */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid var(--border-medium)',
        borderRadius: '4px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '200px', height: '120px' }}>
          <svg viewBox="0 0 200 135" style={{ width: '100%', height: '100%' }}>
            {/* Dial Outer Rim */}
            <path
              d={describeArc(cx, cy, r + 8, startAngle - 5, startAngle + sweepAngle + 5)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
            />

            {/* Background Track */}
            <path
              d={describeArc(cx, cy, r, startAngle, startAngle + sweepAngle)}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="10"
            />

            {/* OK Arc Zone */}
            <path
              d={describeArc(
                cx, cy, r,
                warnLow !== undefined ? warnAngleLow : startAngle,
                warnHigh !== undefined ? warnAngleHigh : startAngle + sweepAngle
              )}
              fill="none"
              stroke="#22c55e"
              strokeWidth="10"
            />

            {/* High Warning Arc */}
            {warnHigh !== undefined && (
              <path
                d={describeArc(cx, cy, r, warnAngleHigh, critHigh !== undefined ? critAngleHigh : startAngle + sweepAngle)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
              />
            )}

            {/* High Critical Arc */}
            {critHigh !== undefined && (
              <path
                d={describeArc(cx, cy, r, critAngleHigh, startAngle + sweepAngle)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
              />
            )}

            {/* Low Warning Arc */}
            {warnLow !== undefined && (
              <path
                d={describeArc(cx, cy, r, critLow !== undefined ? critAngleLow : startAngle, warnAngleLow)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
              />
            )}

            {/* Low Critical Arc */}
            {critLow !== undefined && (
              <path
                d={describeArc(cx, cy, r, startAngle, critAngleLow)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
              />
            )}

            {/* Tick Marks */}
            {Array.from({ length: 11 }).map((_, i) => {
              const t = i / 10;
              const tickA = startAngle + t * sweepAngle;
              const isMajor = i % 2 === 0;
              const p1 = polarToCartesian(cx, cy, r - 6, tickA);
              const p2 = polarToCartesian(cx, cy, r - (isMajor ? 14 : 10), tickA);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isMajor ? "#475569" : "#94a3b8"}
                  strokeWidth={isMajor ? "1.5" : "1"}
                />
              );
            })}

            {/* Mechanical Pointer Needle */}
            <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
              <polygon points={`${cx - 2.5},${cy} ${cx},${cy - r + 6} ${cx + 2.5},${cy}`} fill="#0f172a" />
              <circle cx={cx} cy={cy} r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
            </g>

            {/* Scale Min / Max Numbers */}
            <text x="36" y="108" fill="#64748b" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="middle">{min}</text>
            <text x="164" y="108" fill="#64748b" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="middle">{max}</text>
          </svg>
        </div>

        {/* Digital LCD Window */}
        <div className="scada-lcd-box" style={{ marginTop: '-6px', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {currentVal.toFixed(precision)}
            </span>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
