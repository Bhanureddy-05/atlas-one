import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Music, Mic, Award, Clock } from 'lucide-react'
import { useSingingSessions, useSingingStats, useCreateSingingSession } from '@/hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function SingingPage() {
  const { data: logs, isLoading: logsLoading } = useSingingSessions()
  const { data: stats } = useSingingStats()
  const logSession = useCreateSingingSession()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ practice_minutes: '', breathing_exercises_minutes: '', alankars_practiced: '', songs_practiced: '', voice_notes: '', quality_rating: 3 })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    logSession.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        practice_minutes: parseInt(form.practice_minutes || '0'),
        breathing_exercises_minutes: parseInt(form.breathing_exercises_minutes || '0'),
        alankars_practiced: parseInt(form.alankars_practiced || '0'),
        songs_practiced: form.songs_practiced ? JSON.stringify(form.songs_practiced.split(',').map(s => s.trim())) : '[]',
        voice_notes: form.voice_notes || null,
        quality_rating: form.quality_rating
      },
      {
        onSuccess: () => {
          setForm({ practice_minutes: '', breathing_exercises_minutes: '', alankars_practiced: '', songs_practiced: '', voice_notes: '', quality_rating: 3 })
          setShowForm(false)
        }
      }
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">🎵 Singing & Voice Practice</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Monitor daily practice, log alankars, breathing exercises, and voice quality.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Log Session
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Weekly Practice</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.weekly_minutes || 0} mins</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Monthly Practice</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.monthly_minutes || 0} mins</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Weekly Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.weekly_sessions || 0}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Monthly Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.monthly_sessions || 0}</div>
        </div>
      </div>

      {/* Double Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Recent Practice Sessions */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Practice Logs</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {logsLoading ? (
              <div className="skeleton" style={{ height: 100, borderRadius: 10 }} />
            ) : (
              logs?.map((log: any) => {
                let songs = []
                try {
                  songs = JSON.parse(log.songs_practiced || '[]')
                } catch {
                  songs = []
                }
                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 14,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mic size={14} color="#ec4899" /> {log.practice_minutes} mins
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        Breathing: {log.breathing_exercises_minutes}m • Alankars: {log.alankars_practiced}
                      </div>
                      {songs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {songs.map((song: string) => (
                            <span key={song} className="badge badge-primary" style={{ fontSize: 10 }}>{song}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>Rating: {log.quality_rating}/5</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{log.date}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Information / Reminders Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Voice Routine Tips</h3>
          <div style={{ display: 'grid', gap: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Clock size={16} color="#ec4899" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Warmup first: Begin with humming, lip trills, and gentle scales (alankars) for 10-15 minutes.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Mic size={16} color="#ec4899" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Breathing exercises: Dedicate 5-10 minutes to deep diaphragmatic breaths to sustain notes.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Log Session Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Practice Session</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Practice Mins *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 30"
                    value={form.practice_minutes}
                    onChange={e => setForm(f => ({ ...f, practice_minutes: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Breathing Mins</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 10"
                    value={form.breathing_exercises_minutes}
                    onChange={e => setForm(f => ({ ...f, breathing_exercises_minutes: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Alankars Completed</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5"
                  value={form.alankars_practiced}
                  onChange={e => setForm(f => ({ ...f, alankars_practiced: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Songs Practiced (comma separated)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Tum Hi Ho, Raag Bhairav"
                  value={form.songs_practiced}
                  onChange={e => setForm(f => ({ ...f, songs_practiced: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Performance Rating (1-5)</label>
                <select
                  className="input-field"
                  value={form.quality_rating}
                  onChange={e => setForm(f => ({ ...f, quality_rating: parseInt(e.target.value) }))}
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Voice Notes</label>
                <textarea
                  className="input-field"
                  placeholder="Breath support was good, struggled with high notes..."
                  value={form.voice_notes}
                  onChange={e => setForm(f => ({ ...f, voice_notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
