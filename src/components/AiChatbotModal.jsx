import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { evalMachineStatus } from '../services/factorySchema';

export function AiChatbotModal({ factoryUnits, machinesState, alertLogs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');

  const initialOptions = [
    "What is Acoustic Anomaly Score?",
    "Summarize current plant status",
    "Explain CNC Mill spindle vibration",
    "How to handle Boiler pressure warning?"
  ];

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Hello! I am your WATCHTOWER AI Copilot. I continuously monitor telemetry across all 12 factory machines. Select an option below or type a question to get started:",
      options: initialOptions
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Compute live plant summary for AI responses
  let critCount = 0;
  let warnCount = 0;
  let okCount = 0;

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

  const plantHealthIndex = Math.max(0, 100 - (warnCount * 8) - (critCount * 25));

  // AI Response Generator Logic returning text + follow-up options
  const generateAiAnswer = (query) => {
    const q = query.toLowerCase();

    if (q.includes('plant status') || q.includes('summary') || q.includes('health')) {
      return {
        text: `**Watchtower Plant Operations Summary**:\n- **Plant Health Index**: ${plantHealthIndex.toFixed(0)}%\n- **Total Machines**: 12 across 6 units\n- **OK**: ${okCount} | **Warnings**: ${warnCount} | **Critical**: ${critCount}\n- **Active Alarm Stream**: ${alertLogs.length} logged events.\n\n${warnCount > 0 || critCount > 0 ? "⚠️ Immediate attention recommended for machines with elevated acoustic or thermal drift!" : "✅ All production units are operating within nominal baseline parameters."}`,
        options: [
          "Explain CNC Mill spindle vibration",
          "How to handle Boiler pressure warning?",
          "What is Acoustic Anomaly Score?"
        ]
      };
    }

    if (q.includes('acoustic') || q.includes('sound') || q.includes('fft')) {
      return {
        text: `**Acoustic Anomaly Score (0–100%)**:\n- **Nominal (0–37%)**: Normal acoustic harmonics.\n- **Warning (38–64%)**: Early micro-chatter, bearing race wear, or cavitation.\n- **Critical (≥65%)**: Severe mechanical grinding or impending bearing failure.\n\n💡 *Key Insight*: Acoustic monitoring catches bearing degradation and cavitation **10–14 days earlier** than thermal or pressure sensors!`,
        options: [
          "Summarize current plant status",
          "Explain CNC Mill spindle vibration"
        ]
      };
    }

    if (q.includes('cnc') || q.includes('spindle') || q.includes('m-101')) {
      return {
        text: `**Machine M-101 (CNC Milling Center)**:\n- **Spindle Temperature**: Norm 42.5°C | Warn 75.0°C | Crit 92.0°C\n- **Axis Vibration**: Norm 1.8 mm/s | Warn 6.5 mm/s | Crit 10.5 mm/s\n- **Coolant Pressure**: Norm 62.0 PSI | Warn (Low) 35.0 PSI\n\n*Acoustic Baseline*: 2.4 kHz harmonic envelope. Spindle bearing wear causes 3.2 kHz acoustic spikes.`,
        options: [
          "How to handle Boiler pressure warning?",
          "What is Acoustic Anomaly Score?"
        ]
      };
    }

    if (q.includes('boiler') || q.includes('m-401') || q.includes('steam')) {
      return {
        text: `**Machine M-401 (High-Pressure Industrial Boiler)**:\n- **Steam Pressure**: Norm 18.5 Bar | Warn 28.5 Bar | Crit 34.5 Bar\n- **Flue Gas Temp**: Norm 210°C | Warn 315°C\n- **Drum Water Level Delta**: ±45mm Warn | ±75mm Crit\n\n*Emergency Protocol*: If steam pressure exceeds 34.5 Bar, automated relief safety valve trips. Inspect burner flame resonance acoustic signature.`,
        options: [
          "Summarize current plant status",
          "What is Acoustic Anomaly Score?"
        ]
      };
    }

    if (q.includes('clear') || q.includes('ack') || q.includes('alarm')) {
      return {
        text: `**Alarm Management Protocol**:\n1. Click **ACK ALARM** on any entry in the right-hand **Real-Time Alarm Stream** panel.\n2. To purge resolved logs, click the **CLEAR** button in the top right of the alarm panel.\n3. Expand the faulted machine row to view live analog dials and oscilloscope history.`,
        options: [
          "Summarize current plant status",
          "How to handle Boiler pressure warning?"
        ]
      };
    }

    return {
      text: `I evaluated Watchtower telemetry across all 12 machines for your query: **"${query}"**.\n\n- Current Plant Health Score is **${plantHealthIndex.toFixed(0)}%**.\n- We have **${warnCount} Warning(s)** and **${critCount} Critical(s)** active.\n\nYou can inspect live analog arc gauges and 30-point oscilloscope sparklines by clicking any machine row in the main grid!`,
      options: [
        "Summarize current plant status",
        "What is Acoustic Anomaly Score?"
      ]
    };
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');

    setTimeout(() => {
      const aiReply = generateAiAnswer(text);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiReply.text,
        options: aiReply.options
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <>
      {/* Floating Action Button (FAB) at Bottom-Right Corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-header)',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          transition: 'all 0.2s ease'
        }}
      >
        <Sparkles size={18} />
        <span>WATCHTOWER AI</span>
        {critCount > 0 && (
          <span style={{
            background: '#dc2626',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '1px 6px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)'
          }}>
            {critCount} CRIT
          </span>
        )}
      </button>

      {/* Floating Chatbot Modal Popup Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          right: '24px',
          zIndex: 1000,
          width: '380px',
          height: '540px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Modal Header */}
          <div style={{
            background: 'linear-gradient(to right, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '12px 16px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} />
              <div>
                <div className="font-header" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  WATCHTOWER AI COPILOT
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                  LIVE FACTORY TELEMETRY ASSISTANT
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.85,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                marginLeft: 'auto'
              }}
              title="Close Assistant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Status Bar */}
          <div style={{
            background: 'var(--bg-panel-header)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '6px 12px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            <span>PLANT HEALTH: <strong style={{ color: plantHealthIndex > 80 ? '#16a34a' : '#d97706' }}>{plantHealthIndex.toFixed(0)}%</strong></span>
            <span>WARN: {warnCount} | CRIT: {critCount}</span>
          </div>

          {/* Messages History & Options Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-app)'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: msg.sender === 'user' ? '#0284c7' : 'var(--bg-card)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  lineHeight: 1.45,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: idx > 0 ? '4px 0 0 0' : 0 }}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Option Buttons inside message body */}
                {msg.options && msg.options.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {msg.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleSendMessage(opt)}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#0284c7',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{opt}</span>
                        <ChevronRight size={13} style={{ flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                )}

                <div style={{
                  fontSize: '0.6rem',
                  opacity: 0.6,
                  textAlign: 'right',
                  marginTop: '6px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              background: 'var(--bg-panel)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Watchtower Copilot a question..."
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-lcd)',
                color: 'var(--text-bright)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
