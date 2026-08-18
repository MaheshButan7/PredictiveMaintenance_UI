import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, BarChart2, Gauge } from 'lucide-react';
import { evalMachineStatus, evalSensorStatus, evalAcousticStatus } from '../services/factorySchema';
import { AnalogArcGauge } from './AnalogArcGauge';
import { OscilloscopeTrace } from './OscilloscopeTrace';
import { AcousticAnalyzer } from './AcousticAnalyzer';

export function MachineRow({ machineMeta, machineState, onTriggerAnomaly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('gauges');

  if (!machineState) return null;

  const { sensors, history, acousticScore, acousticHistory } = machineState;
  const overallStatus = evalMachineStatus(sensors, acousticScore, machineMeta);
  const acousticStatus = evalAcousticStatus(acousticScore);

  const ledClass = {
    ok: 'scada-led-ok',
    warning: 'scada-led-warn',
    critical: 'scada-led-crit'
  }[overallStatus];

  return (
    <div className={`machine-row ${isExpanded ? 'is-expanded' : ''}`}>
      {/* Compact Header Row */}
      <div className="machine-header-tabular" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Status LED */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className={`scada-led ${ledClass}`} />
        </div>

        {/* Machine Name & Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              {machineMeta.id}
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {machineMeta.name}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {machineMeta.type} • {machineMeta.model}
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className={`scada-tag scada-tag-${overallStatus}`}>
            {overallStatus}
          </span>
        </div>

        {/* Key Inline Live Readouts */}
        <div className="machine-readouts-grid" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {machineMeta.sensors.map(sMeta => {
            const val = sensors[sMeta.id];
            const sStatus = evalSensorStatus(sMeta, val);
            const valColor = sStatus === 'critical' ? 'var(--status-crit)' : sStatus === 'warning' ? 'var(--status-warn)' : 'var(--text-bright)';

            return (
              <div key={sMeta.id} className="scada-lcd-box" style={{ minWidth: '105px', padding: '4px 8px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {sMeta.shortName}
                </span>
                <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: valColor }}>
                  {val !== undefined ? val.toFixed(sMeta.precision) : '--'}&nbsp;
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>{sMeta.unit}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Spectral Status Tag (Compact View) */}
        <div>
          {(() => {
            let specLabel = 'SPECTRUM NOMINAL';
            if (acousticStatus !== 'ok') {
              const freqStr = machineMeta.type?.includes('Spindle') || machineMeta.type?.includes('Turbine') 
                ? '2.4 kHz' 
                : machineMeta.type?.includes('Valve') || machineMeta.type?.includes('Pump') 
                  ? '12.0 kHz' 
                  : '150 Hz';
              const devDb = Math.round(12 + (acousticScore / 100) * 28);
              specLabel = `SPECTRUM ${freqStr} +${devDb}dB`;
            }

            return (
              <span className="scada-tag" style={{
                background: `rgba(${acousticStatus === 'ok' ? '2, 132, 199' : acousticStatus === 'warning' ? '217, 119, 6' : '220, 38, 38'}, 0.12)`,
                color: acousticStatus === 'ok' ? 'var(--acoustic-cyan)' : acousticStatus === 'warning' ? 'var(--status-warn)' : 'var(--status-crit)',
                borderColor: acousticStatus === 'ok' ? 'rgba(2, 132, 199, 0.4)' : acousticStatus === 'warning' ? 'rgba(217, 119, 6, 0.4)' : 'rgba(220, 38, 38, 0.4)'
              }}>
                {specLabel}
              </span>
            );
          })()}
        </div>

        {/* Accordion Expand Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded Accordion Detail Section */}
      {isExpanded && (
        <div className="machine-expanded-detail">
          {/* View Toggle Bar */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-header" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                TELEMETRY DISPLAY MODE:
              </span>
              <button
                className={`scada-btn ${viewMode === 'gauges' ? 'scada-btn-amber' : ''}`}
                onClick={() => setViewMode('gauges')}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                <Gauge size={13} /> ANALOG DIALS
              </button>
              <button
                className={`scada-btn ${viewMode === 'oscilloscope' ? 'scada-btn-amber' : ''}`}
                onClick={() => setViewMode('oscilloscope')}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                <BarChart2 size={13} /> TREND TRACES
              </button>
            </div>

            <button
              className="scada-btn scada-btn-red"
              onClick={() => onTriggerAnomaly(machineMeta.id)}
              style={{ padding: '4px 12px', fontSize: '0.72rem' }}
            >
              <Zap size={13} /> INJECT FAULT
            </button>
          </div>

          {/* 3 Tailored Sensors */}
          {machineMeta.sensors.map(sMeta => {
            const val = sensors[sMeta.id];
            const hist = history[sMeta.id] || [];

            return viewMode === 'gauges' ? (
              <AnalogArcGauge key={sMeta.id} sensorMeta={sMeta} value={val} />
            ) : (
              <OscilloscopeTrace key={sMeta.id} sensorMeta={sMeta} history={hist} />
            );
          })}

          {/* Acoustic Anomaly FFT Panel */}
          <AcousticAnalyzer
            machineMeta={machineMeta}
            acousticScore={acousticScore}
            acousticHistory={acousticHistory}
          />
        </div>
      )}
    </div>
  );
}
