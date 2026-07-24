'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdminView from '@/components/AdminView';
import CoordinatorView from '@/components/CoordinatorView';
import VolunteerView from '@/components/VolunteerView';
import AISummaryModal from '@/components/AISummaryModal';
import WhatsAppSimulatorModal from '@/components/WhatsAppSimulatorModal';

export default function Home() {
  const [activeRole, setActiveRole] = useState<'CHAPTER_LEADER' | 'COORDINATOR' | 'VOLUNTEER'>('CHAPTER_LEADER');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isWASimulatorOpen, setIsWASimulatorOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  const [volunteersData, setVolunteersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, sessRes, volRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/sessions'),
        fetch('/api/volunteers'),
      ]);

      const dash = await dashRes.json();
      const sess = await sessRes.json();
      const vols = await volRes.json();

      setDashboardData(dash);
      setSessionsData(sess);
      setVolunteersData(vols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      
      {/* App Header & Role Switcher */}
      <Header
        currentRole={activeRole}
        onRoleChange={setActiveRole}
        onOpenWASimulator={() => setIsWASimulatorOpen(true)}
        data={dashboardData}
      />

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Volunteer OS Data...</div>
        </div>
      ) : (
        <main>
          {activeRole === 'CHAPTER_LEADER' && (
            <AdminView data={dashboardData} onRefresh={fetchData} />
          )}

          {activeRole === 'COORDINATOR' && (
            <CoordinatorView
              data={dashboardData}
              sessions={sessionsData}
              volunteers={volunteersData}
              onRefresh={fetchData}
              onOpenWASimulator={() => setIsWASimulatorOpen(true)}
            />
          )}

          {activeRole === 'VOLUNTEER' && (
            <VolunteerView
              volunteers={volunteersData}
              sessions={sessionsData}
              onRefresh={fetchData}
            />
          )}
        </main>
      )}

      {/* AI Impact Copilot Modal */}
      <AISummaryModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        centerName={dashboardData?.centers[0]?.name || 'Vihana Center'}
      />

      {/* WhatsApp Interactive Simulator Modal */}
      <WhatsAppSimulatorModal
        isOpen={isWASimulatorOpen}
        onClose={() => setIsWASimulatorOpen(false)}
        volunteers={volunteersData}
        onRefresh={fetchData}
      />

    </div>
  );
}
