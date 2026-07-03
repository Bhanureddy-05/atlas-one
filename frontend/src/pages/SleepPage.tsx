import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Moon, Star, Clock, AlertCircle } from 'lucide-react'
import { useSleepLogs, useSleepStats, useCreateSleepLog } from '@/hooks/useApi'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function SleepPage() {
  const { data: logs, isLoading: logsLoading } = useSleepLogs()
  const { data: stats } = useSleepStats()
  const logSleep = useCreateSleepLog()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ sleep_time: '22:30', wake_time: '06:30', hours: '8.0', quality: 3, notes: '' })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    logSleep.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        sleep_time: form.sleep_time,
        wake_time: form.wake_time,
        hours: parseFloat(form.hours),
        quality: form.quality,
        notes: form.notes || null
      },
      {
        onSuccess: () => {
          setForm({ sleep_time: '22:30', wake_time: '06:30', hours: '8.0', quality: 3, notes: '' })
          setShowForm(false)
        }
      }
    )
  }

  const chartData = stats?.week_data || []

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">😴 Sleep Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Monitor sleep duration, check recovery, and understand averages.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Weekly Sleep Avg</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.weekly_avg_hours || 0} hrs</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Monthly Sleep Avg</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.monthly_avg_hours || 0} hrs</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Optimal sleep target</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>8.0 hrs</div>
        </div>
      </div>

      {/* Double Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Sleep Duration and Quality combo charts */}
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Sleep Hours & Quality Trend</h3>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep history log table */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Sleep Logs</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {logsLoading ? (
                <div className="skeleton" style={{ height: 100, borderRadius: 10 }} />
              ) : (
                logs?.slice(0, 10).map((log: any) => (
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
                        {log.hours} hrs <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>({log.sleep_time} - {log.wake_time})</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{log.notes || 'No description notes'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 2, color: '#fbbf24' }}>
                        {Array(log.quality).fill(0).map((_, i) => (
                          <Star key={i} size={12} fill="#fbbf24" />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{log.date}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tips card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Sleep Hygiene Tips</h3>
          <div style={{ display: 'grid', gap: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Clock size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Go to sleep and wake up at the same time every day, even on weekends.</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Moon size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Maintain a dark, quiet, cool bedroom environment below 20°C.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Log Sleep Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Sleep Session</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Sleep Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.sleep_time}
                    onChange={e => setForm(f => ({ ...f, sleep_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Wake Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.wake_time}
                    onChange={e => setForm(f => ({ ...f, wake_time: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Total Hours *</label>
                <input
                  type="number" step="0.1"
                  className="input-field"
                  placeholder="e.g. 7.5"
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Sleep Quality (1-5)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star} type="button"
                      onClick={() => setForm(f => ({ ...f, quality: star }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={24}
                        fill={star <= form.quality ? '#fbbf24' : 'none'}
                        color={star <= form.quality ? '#fbbf24' : '#475569'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Notes</label>
                <textarea
                  className="input-field"
                  placeholder="Dream details, woke up middle of night..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Sleep</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
