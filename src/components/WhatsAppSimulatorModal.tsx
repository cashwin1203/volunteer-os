'use client';

import React, { useState } from 'react';
import { X, Send, Bot, Check, CheckCheck, MapPin, Sparkles, Smartphone, ThumbsUp, ThumbsDown } from 'lucide-react';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteers: any[];
  onRefresh: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  buttons?: { label: string; action: string }[];
  time: string;
}

export default function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  volunteers,
  onRefresh,
}: WhatsAppSimulatorModalProps) {
  const [selectedVolId, setSelectedVolId] = useState(volunteers[0]?.id || '');
  const activeVol = volunteers.find((v: any) => v.id === selectedVolId) || volunteers[0];

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `🌟 Hi ${activeVol?.name || 'Volunteer'}! Automated Friday Reminder: Saturday session at ${activeVol?.center?.name || 'Vihana Center'} is tomorrow (2:30 PM - 5:30 PM). Will you be attending?`,
      buttons: [
        { label: '✅ Attending', action: 'RSVP_ATTENDING' },
        { label: '❌ Request Absence', action: 'RSVP_ABSENT' },
        { label: '📍 Check In Now', action: 'CHECK_IN' },
      ],
      time: '10:00 AM',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (actionOverride?: string, customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend && !actionOverride) return;

    // Add user message to thread
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: actionOverride
        ? actionOverride === 'RSVP_ATTENDING' ? 'Attending' : actionOverride === 'RSVP_ABSENT' ? 'Request Absence' : 'Check In'
        : textToSend,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: activeVol?.id,
          action: actionOverride,
          text: textToSend,
        }),
      });

      const data = await res.json();

      // Add bot response
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'Message received.',
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
      onRefresh(); // Refresh parent dashboard data
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
        }}
      >
        
        {/* Phone Header */}
        <div style={{
          background: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#25d366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#075e54',
              fontWeight: 700
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700 }}>Volunteer OS Bot</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Official WhatsApp Business Account</div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Volunteer Selector Strip */}
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chatting as:</span>
          <select
            className="form-input"
            value={selectedVolId}
            onChange={(e) => {
              setSelectedVolId(e.target.value);
              setMessages([
                {
                  id: Date.now().toString(),
                  sender: 'bot',
                  text: `🌟 Hi ${volunteers.find(v => v.id === e.target.value)?.name}! Saturday session is coming up. Will you be attending?`,
                  buttons: [
                    { label: '✅ Attending', action: 'RSVP_ATTENDING' },
                    { label: '❌ Request Absence', action: 'RSVP_ABSENT' },
                    { label: '📍 Check In Now', action: 'CHECK_IN' },
                  ],
                  time: getCurrentTime(),
                }
              ]);
            }}
            style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
          >
            {volunteers.map((v: any) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Chat Messages Body */}
        <div style={{
          height: '380px',
          background: '#0b141a',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 211, 102, 0.03) 0%, transparent 80%)',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div
                style={{
                  background: m.sender === 'user' ? '#005c4b' : '#202c33',
                  color: '#e9edef',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <div>{m.text}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: '4px' }}>
                  {m.time} {m.sender === 'user' && <CheckCheck size={12} style={{ display: 'inline', marginLeft: '2px', color: '#53bdeb' }} />}
                </div>
              </div>

              {/* Interactive WhatsApp Reply Buttons */}
              {m.buttons && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                  {m.buttons.map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(b.action)}
                      style={{
                        background: '#202c33',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#00a884',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#2a3942')}
                      onMouseOut={(e) => (e.currentTarget.style.background = '#202c33')}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', background: '#202c33', color: '#8696a0', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem' }}>
              Volunteer OS Bot is typing...
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div style={{ background: '#202c33', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type WhatsApp message or /status..."
            style={{
              background: '#2a3942',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 14px',
              fontSize: '0.84rem',
              color: '#e9edef'
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#00a884',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
