'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  badgeText?: string;
  badgeVariant?: 'active' | 'at-risk' | 'pending';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#6366f1',
  badgeText,
  badgeVariant = 'active',
}: MetricCardProps) {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: `${color}18`,
          border: `1px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          {value}
        </span>
        {badgeText && (
          <span className={`badge badge-${badgeVariant}`} style={{ fontSize: '0.7rem' }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
