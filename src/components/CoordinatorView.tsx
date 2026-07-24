'use client';

import React, { useState } from 'react';
import { Calendar, UserCheck, Check, X, AlertCircle, Plus, BookOpen, Users, CheckCircle2, Palmtree, Smartphone, Send, FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface CoordinatorViewProps {
  data: any;
  sessions: any[];
  volunteers: any[];
  onRefresh: () => void;
  onOpenWASimulator?: () => void;
}

export default function CoordinatorView({ data, sessions, volunteers, onRefresh, onOpenWASimulator }: CoordinatorViewProps) {
  const centers = data?.centers || [];
  const [selectedCenterId, setSelectedCenterId] = useState(centers[0]?.id || '');

  const currentCenter = centers.find((c: any) => c.id === selectedCenterId) || centers[0];
  const centerSessions = sessions.filter((s: any) => !selectedCenterId || s.centerId === selectedCenterId);
  const upcomingSession = centerSessions.find((s: any) => s.status === 'UPCOMING') || centerSessions[0];
  const centerVolunteers = volunteers.filter((v: any) => !selectedCenterId || v.centerId === selectedCenterId);

  // Form states for logging post-session report
  const [topic, setTopic] = useState(upcomingSession?.topicCovered || '');
  const [activities, setActivities] = useState(upcomingSession?.activitiesCompleted || '');
  const [challenges, setChallenges] = useState(upcomingSession?.challengesFaced || '');
  const [loggingReport, setLoggingReport] = useState(false);

  // CSV Import & Emergency Broadcast Modal states
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState('Name, Email, Phone, Skills\nRahul, rahul@example.com, +91 98765 11111, Math\nSneha, sneha@example.com, +91 98765 22222, English');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  const handleToggleHolidayPause = async () => {
    if (!currentCenter) return;
    try {
      await fetch('/api/centers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCenter.id,
          isPausedForHoliday: !currentCenter.isPausedForHoliday,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerWABroadcast = async (type: string = 'RSVP') => {
    if (!currentCenter) return;
    setBroadcastStatus('Processing broadcast...');
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId: currentCenter.id,
          type,
          reason: type === 'EMERGENCY_CANCEL' ? 'Heavy Rainfall & Flooding' : undefined,
        }),
      });
      const resData = await res.json();
      if (resData.status === 'SKIPPED_HOLIDAY') {
        setBroadcastStatus(`⏸️ Skipped: ${resData.message}`);
      } else if (type === 'EMERGENCY_CANCEL') {
        setBroadcastStatus(`🚨 Emergency Cancellation alert broadcasted to ${resData.recipientCount} volunteers!`);
      } else {
        setBroadcastStatus(`✅ Sent automated WhatsApp RSVPs to ${resData.recipientCount} rostered volunteers!`);
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      setBroadcastStatus('Failed to send broadcast');
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/volunteers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: csvText,
          centerId: currentCenter?.id,
        }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setBroadcastStatus(`📥 ${data.message}`);
        setShowCSVModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRSVP = async (attendanceId: string, rsvpStatus: string) => {
    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VOLUNTEER',
          id: attendanceId,
          rsvpStatus,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewSession = async () => {
    if (!currentCenter) return;
    try {
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()));
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId: currentCenter.id,
          sessionDate: nextSaturday.toISOString(),
          startTime: '14:30',
          endTime: '17:30',
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSessionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upcomingSession) return;
    setLoggingReport(true);
    try {
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: upcomingSession.id,
          topicCovered: topic,
          activitiesCompleted: activities,
          challengesFaced: challenges,
          status: 'COMPLETED',
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingReport(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Center Header & Controls */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Centre Leader Console
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
              {currentCenter?.name || 'Vihana Center'}
            </h2>
            {currentCenter?.isPausedForHoliday && (
              <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Palmtree size={12} /> Holiday Pause Active
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            {currentCenter?.location} • Slot: <strong style={{ color: '#a855f7' }}>{currentCenter?.dayOfWeek || 'Saturday'} {currentCenter?.slotTime || '2:30 PM - 5:30 PM'}</strong>
          </p>
        </div>

        {/* Center Controls & Automation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            {centers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Bulk CSV Upload Button */}
          <button className="btn btn-secondary" onClick={() => setShowCSVModal(true)} style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
            <FileSpreadsheet size={15} /> Import CSV
          </button>

          {/* Holiday Pause Toggle */}
          <button
            onClick={handleToggleHolidayPause}
            className={`btn ${currentCenter?.isPausedForHoliday ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          >
            <Palmtree size={15} />
            {currentCenter?.isPausedForHoliday ? 'Resume RSVPs' : 'Pause for Holiday'}
          </button>

          {/* Trigger WhatsApp Broadcast */}
          <button
            onClick={() => handleTriggerWABroadcast('RSVP')}
            className="btn"
            style={{
              background: 'rgba(37, 211, 102, 0.2)',
              border: '1px solid #25d366',
              color: '#25d366',
              padding: '8px 12px',
              fontSize: '0.82rem'
            }}
          >
            <Send size={14} /> Send RSVPs
          </button>

          {/* Emergency Session Cancellation */}
          <button
            onClick={() => handleTriggerWABroadcast('EMERGENCY_CANCEL')}
            className="btn"
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              color: '#fb7185',
              padding: '8px 12px',
              fontSize: '0.82rem'
            }}
          >
            <AlertTriangle size={14} /> Emergency Cancel
          </button>
        </div>
      </div>

      {/* Broadcast Status Notification Banner */}
      {broadcastStatus && (
        <div style={{
          background: broadcastStatus.includes('Skipped') ? 'rgba(245, 158, 11, 0.15)' : broadcastStatus.includes('Emergency') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(37, 211, 102, 0.15)',
          border: broadcastStatus.includes('Skipped') ? '1px solid rgba(245, 158, 11, 0.4)' : broadcastStatus.includes('Emergency') ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(37, 211, 102, 0.4)',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff'
        }}>
          <span>{broadcastStatus}</span>
          {onOpenWASimulator && !broadcastStatus.includes('Skipped') && (
            <button
              className="btn"
              onClick={onOpenWASimulator}
              style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#25d366', color: '#075e54', fontWeight: 700 }}
            >
              Open Simulator to Test 📱
            </button>
          )}
        </div>
      )}

      {/* Grid: Upcoming Session Roster vs Session Report Logger */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Upcoming Session Roster */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.1rem' }}>Saturday Session Roster</h3>
            </div>
            {upcomingSession && (
              <span className={`badge badge-${upcomingSession.status.toLowerCase()}`}>
                {upcomingSession.status}
              </span>
            )}
          </div>

          {!upcomingSession ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '0.88rem', marginBottom: '12px' }}>No session generated for this weekend.</p>
              <button className="btn btn-primary" onClick={handleCreateNewSession}>Generate Upcoming Session</button>
            </div>
          ) : (
            <div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Date: <strong style={{ color: '#fff' }}>{new Date(upcomingSession.sessionDate).toLocaleDateString()}</strong>
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Time: <strong style={{ color: '#fff' }}>{upcomingSession.startTime} - {upcomingSession.endTime}</strong>
                </span>
              </div>

              {/* Roster list of volunteers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingSession.volunteerAttendances?.map((att: any) => (
                  <div
                    key={att.id}
                    style={{
                      background: 'rgba(18, 25, 41, 0.9)',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{att.volunteer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{att.volunteer?.skills}</div>
                    </div>

                    {/* RSVP Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleUpdateRSVP(att.id, 'ATTENDING')}
                        style={{
                          background: att.rsvpStatus === 'ATTENDING' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: att.rsvpStatus === 'ATTENDING' ? '1px solid #10b981' : '1px solid var(--border-color)',
                          color: att.rsvpStatus === 'ATTENDING' ? '#34d399' : 'var(--text-muted)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Attending
                      </button>
                      <button
                        onClick={() => handleUpdateRSVP(att.id, 'ABSENT')}
                        style={{
                          background: att.rsvpStatus === 'ABSENT' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: att.rsvpStatus === 'ABSENT' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                          color: att.rsvpStatus === 'ABSENT' ? '#fb7185' : 'var(--text-muted)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleUpdateRSVP(att.id, 'BACKUP')}
                        style={{
                          background: att.rsvpStatus === 'BACKUP' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: att.rsvpStatus === 'BACKUP' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                          color: att.rsvpStatus === 'BACKUP' ? '#22d3ee' : 'var(--text-muted)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Backup
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Post Session Execution & Topic Logging */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={18} color="#a855f7" />
            <h3 style={{ fontSize: '1.1rem' }}>Log Educational Session Notes</h3>
          </div>

          <form onSubmit={handleSaveSessionReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Topic / Subject Taught
              </label>
              <input
                type="text"
                className="form-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, English Vocabulary"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Activities & Exercises Conducted
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="e.g. Pizza slice fractions game, group reading"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Challenges & Follow-up Needed
              </label>
              <input
                type="text"
                className="form-input"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="e.g. 3 students need help with long division"
              />
            </div>

            <button
              type="submit"
              className="btn btn-emerald"
              disabled={loggingReport || !upcomingSession}
              style={{ justifyContent: 'center', marginTop: '6px' }}
            >
              <CheckCircle2 size={16} /> Mark Session Completed & Save Notes
            </button>
          </form>
        </div>

      </div>

      {/* CSV Roster Upload Modal */}
      {showCSVModal && (
        <div className="modal-overlay" onClick={() => setShowCSVModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Bulk Import Volunteer Roster (CSV)</h3>
              </div>
              <button onClick={() => setShowCSVModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCSVImport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Paste CSV Data (Name, Email, Phone, Skills)
                </label>
                <textarea
                  className="form-input"
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>
                  Upload & Import to {currentCenter?.name}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCSVModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
