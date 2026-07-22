'use client';

import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, Bot } from 'lucide-react';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName?: string;
}

export default function AISummaryModal({ isOpen, onClose, centerName = 'Vihana Center' }: AISummaryModalProps) {
  const [topic, setTopic] = useState('Fractions & Basic Algebra');
  const [activities, setActivities] = useState('Pizza slice activity, student 1-on-1 tutoring, group flashcards');
  const [challenges, setChallenges] = useState('3 students struggled with long division steps');
  const [loading, setLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerName,
          topic,
          activities,
          challenges,
          studentCount: 45,
          volunteerCount: 12,
        }),
      });
      const data = await res.json();
      setGeneratedSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <Bot size={20} color="#c084fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Impact Copilot</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Synthesize session notes & impact metrics into executive summaries
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {!generatedSummary ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Center / Program
              </label>
              <input type="text" className="form-input" value={centerName} readOnly style={{ opacity: 0.8 }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Topic / Subject Covered
              </label>
              <input
                type="text"
                className="form-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, English Reading"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Activities & Methods
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="Describe key learning activities"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Challenges & Student Needs
              </label>
              <input
                type="text"
                className="form-input"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="e.g. 3 students need extra division practice"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            >
              {loading ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? 'Synthesizing Report...' : 'Generate Executive Report'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-line',
              fontSize: '0.88rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              {generatedSummary}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-emerald"
                onClick={handleCopy}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setGeneratedSummary('')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Create Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
