'use client';

import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, UserCheck, MapPin, Award, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

interface VolunteerViewProps {
  volunteers: any[];
  sessions: any[];
  onRefresh: () => void;
}

export default function VolunteerView({ volunteers, sessions, onRefresh }: VolunteerViewProps) {
  const [selectedVolId, setSelectedVolId] = useState(volunteers[0]?.id || '');
  const activeVol = volunteers.find((v: any) => v.id === selectedVolId) || volunteers[0];

  const volCenterSessions = sessions.filter((s: any) => !activeVol?.centerId || s.centerId === activeVol?.centerId);
  const nextSession = volCenterSessions.find((s: any) => s.status === 'UPCOMING') || volCenterSessions[0];
  const myAttendance = nextSession?.volunteerAttendances?.find((a: any) => a.volunteerId === activeVol?.id);

  const [checkedIn, setCheckedIn] = useState(myAttendance?.checkInStatus === 'PRESENT');
  const [checkInTime, setCheckInTime] = useState<string | null>(checkedIn ? '2:30 PM' : null);

  const handleRSVP = async (rsvpStatus: string) => {
    if (!myAttendance) return;
    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VOLUNTEER',
          id: myAttendance.id,
          rsvpStatus,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckInToggle = async () => {
    if (!myAttendance) return;
    const newStatus = checkedIn ? 'PENDING' : 'PRESENT';
    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VOLUNTEER',
          id: myAttendance.id,
          checkInStatus: newStatus,
          hoursLogged: newStatus === 'PRESENT' ? 3 : 0,
        }),
      });
      setCheckedIn(!checkedIn);
      setCheckInTime(!checkedIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Volunteer Profile Switcher */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#fff'
          }}>
            {activeVol?.name ? activeVol.name[0] : 'V'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{activeVol?.name || 'Volunteer Portal'}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Assigned Center: <strong style={{ color: '#34d399' }}>{activeVol?.center?.name || 'Vihana Center'}</strong> • {activeVol?.skills}
            </p>
          </div>
        </div>

        {/* Switch Volunteer Dropdown */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Switch Volunteer Profile (Demo)
          </label>
          <select
            className="form-input"
            value={selectedVolId}
            onChange={(e) => setSelectedVolId(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            {volunteers.map((v: any) => (
              <option key={v.id} value={v.id}>{v.name} ({v.center?.name || 'Unassigned'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personal Impact Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Contribution
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>
            {activeVol?.totalHours || 0} hrs
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Field Tutoring</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Attendance Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa' }}>
            94%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excellent Reliability</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Weekly Fixed Slot
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#facc15', marginTop: '6px' }}>
            Saturday 2:30 PM
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vihana Center</span>
        </div>
      </div>

      {/* Main Action: RSVP & One-Tap Check-In */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Next Saturday RSVP Card */}
        <div className="glass-panel-glow" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#6366f1" />
              <h3 style={{ fontSize: '1.15rem' }}>Next Session RSVP</h3>
            </div>
            {myAttendance?.rsvpStatus && (
              <span className={`badge badge-${myAttendance.rsvpStatus.toLowerCase()}`}>
                RSVP: {myAttendance.rsvpStatus}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Please confirm your availability for this Saturday at <strong style={{ color: '#fff' }}>Vihana Center</strong> (2:30 PM - 5:30 PM).
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-emerald"
              onClick={() => handleRSVP('ATTENDING')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ThumbsUp size={16} /> Attending
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleRSVP('ABSENT')}
              style={{ flex: 1, justifyContent: 'center', color: '#fb7185' }}
            >
              <ThumbsDown size={16} /> Request Absence
            </button>
          </div>
        </div>

        {/* Mobile One-Tap Check-In */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MapPin size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem' }}>Field Check-In Widget</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              When arriving at the center on Saturday, check in below to verify your 3-hour contribution.
            </p>
          </div>

          <div>
            <button
              onClick={handleCheckInToggle}
              className={`btn ${checkedIn ? 'btn-secondary' : 'btn-primary'}`}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                background: checkedIn ? 'rgba(16, 185, 129, 0.2)' : undefined,
                border: checkedIn ? '1px solid #10b981' : undefined,
                color: checkedIn ? '#34d399' : undefined
              }}
            >
              <CheckCircle2 size={18} />
              {checkedIn ? `Checked In (${checkInTime || '2:30 PM'}) • Tap to Check Out` : 'Check In at Vihana Center'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
