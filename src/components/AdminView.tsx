'use client';

import React, { useState } from 'react';
import MetricCard from './MetricCard';
import { Users, Clock, Building2, GraduationCap, AlertTriangle, CheckCircle2, UserPlus, FileSpreadsheet } from 'lucide-react';

interface AdminViewProps {
  data: any;
  onRefresh: () => void;
}

export default function AdminView({ data, onRefresh }: AdminViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVolName, setNewVolName] = useState('');
  const [newVolEmail, setNewVolEmail] = useState('');
  const [newVolSkills, setNewVolSkills] = useState('Mathematics, English');
  const [selectedCenterId, setSelectedCenterId] = useState('');

  const metrics = data?.metrics || {
    totalVolunteers: 36,
    activeVolunteers: 32,
    atRiskVolunteers: 4,
    totalCenters: 3,
    totalStudents: 120,
    totalHours: 516,
    volunteerRetentionRate: 89,
  };

  const centers = data?.centers || [];
  const atRiskList = data?.atRiskList || [];

  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVolName,
          email: newVolEmail,
          skills: newVolSkills,
          centerId: selectedCenterId || (centers[0]?.id || null),
        }),
      });
      setShowAddModal(false);
      setNewVolName('');
      setNewVolEmail('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Chapter Leader Operations Dashboard (Navin D)</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Real-time monitoring of center capacity, volunteer retention, and student educational reach across Bangalore.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <UserPlus size={16} /> Add Active Volunteer
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Active Volunteers"
          value={metrics.activeVolunteers}
          subtitle={`${metrics.volunteerRetentionRate}% Retention Rate`}
          icon={Users}
          color="#6366f1"
          badgeText="Healthy"
          badgeVariant="active"
        />
        <MetricCard
          title="Total Hours Logged"
          value={`${metrics.totalHours} hrs`}
          subtitle="Across 3 centers in Bangalore"
          icon={Clock}
          color="#10b981"
          badgeText="Up 14%"
          badgeVariant="active"
        />
        <MetricCard
          title="Students Supported"
          value={metrics.totalStudents}
          subtitle="Fixed weekly slot tutoring"
          icon={GraduationCap}
          color="#06b6d4"
        />
        <MetricCard
          title="Active Centers"
          value={metrics.totalCenters}
          subtitle="Vihana, Mala, Ramamurthynagar"
          icon={Building2}
          color="#a855f7"
        />
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Center Operational Directory */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Center Capacity & Operations</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>3 Active Centers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {centers.map((c: any) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.98rem', marginBottom: '4px' }}>{c.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {c.location} • <strong style={{ color: '#a855f7' }}>{c.dayOfWeek} {c.slotTime}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c._count?.volunteers || 0} / {c.targetVolunteerCount} Volunteers
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c._count?.students || 0} Enrolled Students
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Volunteer Health Watchlist */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#fb7185" />
              <h3 style={{ fontSize: '1.1rem' }}>Retention Risk Watchlist</h3>
            </div>
            <span className="badge badge-at-risk">{atRiskList.length} Volunteers Needing Attention</span>
          </div>

          {atRiskList.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={32} color="#34d399" style={{ margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '0.88rem' }}>No high-risk volunteer churn detected this week!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {atRiskList.map((vol: any) => (
                <div
                  key={vol.id}
                  style={{
                    background: 'rgba(244, 63, 94, 0.06)',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#fecdd3' }}>{vol.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {vol.center?.name || 'Unassigned'} • {vol.skills}
                    </p>
                  </div>
                  <span className="badge badge-at-risk" style={{ fontSize: '0.68rem' }}>
                    Missed 2+ Sessions
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Onboard Approved Volunteer</h3>
            <form onSubmit={handleCreateVolunteer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input type="text" className="form-input" required value={newVolName} onChange={(e) => setNewVolName(e.target.value)} placeholder="e.g. Vikram Seth" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input type="email" className="form-input" required value={newVolEmail} onChange={(e) => setNewVolEmail(e.target.value)} placeholder="vikram@example.com" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Teaching Skills</label>
                <input type="text" className="form-input" value={newVolSkills} onChange={(e) => setNewVolSkills(e.target.value)} placeholder="Mathematics, Science" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assign to Center</label>
                <select className="form-input" value={selectedCenterId} onChange={(e) => setSelectedCenterId(e.target.value)}>
                  {centers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add to Roster</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
