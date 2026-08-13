import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Trash2, Check } from 'lucide-react';

export function AlertsSidebar({ alerts = [], onAcknowledgeAlert, onClearAlerts }) {
  const [filter, setFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(item => {
    if (filter === 'WARNING') return item.severity === 'warning';
    if (filter === 'CRITICAL') return item.severity === 'critical';
    return true;
  });

  const activeCritCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const activeWarnCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-medium)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 100px)',
      position: 'sticky',
      top: '85px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Alarm Annunciator Header */}
      <div style={{
        background: '#f1f5f9',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-header" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              REAL-TIME ALARM STREAM
            </span>
          </div>

          <button
            className="scada-btn"
            onClick={onClearAlerts}
            title="Clear Event Log"
            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
          >
            <Trash2 size={12} /> CLEAR
          </button>
        </div>

        {/* Alarm Counters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="scada-tag scada-tag-crit" style={{ fontSize: '0.68rem' }}>
            {activeCritCount} PRIORITY 1 (CRIT)
          </span>
          <span className="scada-tag scada-tag-warn" style={{ fontSize: '0.68rem' }}>
            {activeWarnCount} PRIORITY 2 (WARN)
          </span>
        </div>

        {/* Filter Selector */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          {['ALL', 'CRITICAL', 'WARNING'].map(fKey => (
            <button
              key={fKey}
              onClick={() => setFilter(fKey)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filter === fKey ? 'var(--border-bright)' : 'var(--border-subtle)',
                background: filter === fKey ? '#ffffff' : '#f8fafc',
                color: filter === fKey ? '#0f172a' : 'var(--text-muted)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {fKey}
            </button>
          ))}
        </div>
      </div>

      {/* Alarm Log Feed List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {filteredAlerts.length === 0 ? (
          <div style={{
            padding: '40px 12px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)'
          }}>
            [ NO ACTIVE ALERTS LOGGED ]
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            const borderCol = isCrit ? 'var(--status-crit-border)' : isWarn ? 'var(--status-warn-border)' : 'var(--status-ok-border)';
            const bgCol = isCrit ? 'var(--status-crit-bg)' : isWarn ? 'var(--status-warn-bg)' : 'var(--status-ok-bg)';
            const textCol = isCrit ? '#dc2626' : isWarn ? '#d97706' : '#16a34a';
            const priorityTag = isCrit ? 'P1-CRIT' : isWarn ? 'P2-WARN' : 'INFO';

            return (
              <div
                key={alert.id}
                style={{
                  background: bgCol,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '6px',
                  padding: '12px 14px',
                  opacity: alert.acknowledged ? 0.55 : 1,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="scada-tag" style={{ background: '#ffffff', color: textCol, borderColor: borderCol, fontSize: '0.65rem' }}>
                      {priorityTag}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      {alert.machineId}
                    </span>
                  </div>

                  <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {alert.timestamp}
                  </span>
                </div>

                {/* Sensor & Value Readout */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                  <strong style={{ color: textCol }}>{alert.sensorName}:</strong> {alert.value}
                </div>

                {/* Message */}
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
                  {alert.message}
                </div>

                {/* ACK Button */}
                {!alert.acknowledged && (isCrit || isWarn) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      className="scada-btn"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                    >
                      <Check size={11} /> ACK ALARM
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
