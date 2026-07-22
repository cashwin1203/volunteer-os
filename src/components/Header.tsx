'use client';

import React from 'react';
import { Layers, Shield, UserCheck, Users, MapPin, Sparkles, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeRole: 'ADMIN' | 'COORDINATOR' | 'VOLUNTEER';
  setActiveRole: (role: 'ADMIN' | 'COORDINATOR' | 'VOLUNTEER') => void;
  onOpenAISummary?: () => void;
  onOpenWASimulator?: () => void;
}

export default function Header({ activeRole, setActiveRole, onOpenAISummary, onOpenWASimulator }: HeaderProps) {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '28px', borderTop: 'none', borderRadius: '0 0 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Volunteer OS</h1>
              <span className="badge badge-active" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> U&I Bangalore
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Operating System for Volunteer-Led Education Centers
            </p>
          </div>
        </div>

        {/* Role Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {onOpenWASimulator && (
            <button
              className="btn"
              onClick={onOpenWASimulator}
              style={{
                background: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#25d366',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              <Smartphone size={16} /> WhatsApp Bot
            </button>
          )}

          {onOpenAISummary && (
            <button className="btn btn-secondary" onClick={onOpenAISummary} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <Sparkles size={16} color="#a855f7" /> AI Impact Copilot
            </button>
          )}

          {/* Role Switcher Pills */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveRole('ADMIN')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeRole === 'ADMIN' ? 'var(--accent-primary)' : 'transparent',
                color: activeRole === 'ADMIN' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={14} /> Chapter Leader (Navin D)
            </button>

            <button
              onClick={() => setActiveRole('COORDINATOR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeRole === 'COORDINATOR' ? 'var(--accent-primary)' : 'transparent',
                color: activeRole === 'COORDINATOR' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <UserCheck size={14} /> Center Coordinator
            </button>

            <button
              onClick={() => setActiveRole('VOLUNTEER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeRole === 'VOLUNTEER' ? 'var(--accent-primary)' : 'transparent',
                color: activeRole === 'VOLUNTEER' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Users size={14} /> Field Volunteer (Gomesh)
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
