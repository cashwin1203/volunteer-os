'use client';

import React, { useState } from 'react';
import { UserCheck, Sparkles, Smartphone, Rocket } from 'lucide-react';
import AISummaryModal from './AISummaryModal';
import LaunchActivityModal from './LaunchActivityModal';

interface HeaderProps {
  currentRole: 'CHAPTER_LEADER' | 'COORDINATOR' | 'VOLUNTEER';
  onRoleChange: (role: 'CHAPTER_LEADER' | 'COORDINATOR' | 'VOLUNTEER') => void;
  onOpenWASimulator?: () => void;
  data?: any;
}

export default function Header({ currentRole, onRoleChange, onOpenWASimulator, data }: HeaderProps) {
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [showLaunchHub, setShowLaunchHub] = useState(false);

  return (
    <>
      <header
        className="glass-panel"
        style={{
          padding: '14px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderColor: 'rgba(204, 17, 0, 0.20)',
        }}
      >

        {/* Brand Identity — U&I Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* U&I Logo */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(204, 17, 0, 0.40)',
            border: '1px solid rgba(204, 17, 0, 0.30)',
          }}>
            <img
              src="/uni-logo.png"
              alt="U&I India Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Brand Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                background: 'linear-gradient(90deg, #ffffff 0%, #f1a8a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Volunteer OS
              </h1>
              <span
                className="badge badge-emerald"
                style={{ fontSize: '0.62rem', letterSpacing: '0.06em' }}
              >
                Live
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.01em' }}>
              U&I India &nbsp;•&nbsp; <span style={{ color: 'rgba(204, 17, 0, 0.85)', fontWeight: 600 }}>Be The Change</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* 20-Min Launch Games */}
          <button
            className="btn btn-secondary"
            onClick={() => setShowLaunchHub(true)}
            style={{ border: '1px solid rgba(204, 17, 0, 0.30)', color: '#ff6b5b', fontSize: '0.82rem' }}
          >
            <Rocket size={15} color="#CC1100" /> Launch Games
          </button>

          {/* AI Donor Copilot */}
          <button
            className="btn btn-secondary"
            onClick={() => setShowAICopilot(true)}
            style={{ border: '1px solid rgba(255,255,255,0.10)', fontSize: '0.82rem' }}
          >
            <Sparkles size={15} color="#fbbf24" /> Donor Copilot
          </button>

          {/* WhatsApp Simulator */}
          {onOpenWASimulator && (
            <button
              className="btn"
              onClick={onOpenWASimulator}
              style={{
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.40)',
                color: '#25d366',
                fontSize: '0.82rem',
              }}
            >
              <Smartphone size={15} /> WhatsApp Bot
            </button>
          )}

          {/* Role Switcher */}
          <div style={{
            background: 'rgba(10, 8, 8, 0.7)',
            border: '1px solid rgba(204, 17, 0, 0.20)',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <UserCheck size={15} color="#CC1100" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>View As:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="CHAPTER_LEADER" style={{ background: '#100a0a' }}>Navin D (Chapter Leader)</option>
              <option value="COORDINATOR" style={{ background: '#100a0a' }}>Ashwin C (Coordinator)</option>
              <option value="VOLUNTEER" style={{ background: '#100a0a' }}>Gomesh (Field Volunteer)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AISummaryModal
        isOpen={showAICopilot}
        onClose={() => setShowAICopilot(false)}
        centerName={data?.centers?.[0]?.name || 'Vihana Center'}
      />
      <LaunchActivityModal
        isOpen={showLaunchHub}
        onClose={() => setShowLaunchHub(false)}
      />
    </>
  );
}
