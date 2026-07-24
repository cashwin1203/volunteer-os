'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, X, Sparkles, Gamepad2, Lightbulb, RefreshCw, Zap } from 'lucide-react';

interface LaunchActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LaunchActivityModal({ isOpen, onClose }: LaunchActivityModalProps) {
  const [games, setGames] = useState<any[]>([]);
  const [customIdea, setCustomIdea] = useState('');
  const [variations, setVariations] = useState<any[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/launch-activities')
        .then((res) => res.json())
        .then((data) => {
          if (data.games) setGames(data.games);
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateVariations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdea.trim()) return;
    setLoadingVariations(true);

    try {
      const res = await fetch('/api/launch-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: customIdea }),
      });
      const data = await res.json();
      if (data.variations) {
        setVariations(data.variations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVariations(false);
    }
  };

  const filteredGames = selectedCategory === 'ALL'
    ? games
    : games.filter((g) => g.category === selectedCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Rocket size={24} color="#a855f7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>20-Min Launch & De-stress Activity Hub</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Energizing games & fun activities for the final 20 minutes of your Saturday class
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['ALL', 'Educational Fun', 'Zero-Prop Energizers', 'Team Building & Fun'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                border: selectedCategory === cat ? '1px solid #a855f7' : '1px solid var(--border-color)',
                color: selectedCategory === cat ? '#c084fc' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Game Ideas Bank */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {filteredGames.map((g) => (
            <div
              key={g.id}
              style={{
                background: 'rgba(18, 25, 41, 0.9)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {g.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱️ {g.durationMinutes} mins</span>
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '6px' }}>{g.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {g.description}
                </p>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Props Needed: <strong style={{ color: '#fff' }}>{g.propsNeeded}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* AI Game Variation Generator Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '14px',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="#c084fc" />
            <h4 style={{ fontSize: '1.05rem', margin: 0, color: '#fff' }}>Submit Game Idea & Get Creative AI Variations</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Have a game you want to try with the kids? Type it below to generate 3 customized 20-minute variations!
          </p>

          <form onSubmit={handleGenerateVariations} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              placeholder="e.g. Memory card game with math equations or Pictionary"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-emerald"
              disabled={loadingVariations || !customIdea.trim()}
              style={{ padding: '0 16px', fontSize: '0.85rem' }}
            >
              {loadingVariations ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
              Generate Variations
            </button>
          </form>

          {/* Render Variations */}
          {variations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>
                💡 3 Creative 20-Min Variations for "{customIdea}":
              </div>
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    padding: '12px 14px',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{v.variationName}</span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                      {v.style}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {v.instruction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
