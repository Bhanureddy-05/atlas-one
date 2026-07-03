import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Flame, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { useTodayHabits, useHabits, useCreateHabit, useLogHabit, useDeleteHabit } from '@/hooks/useApi'
import { getTodayString } from '@/lib/utils'
import toast from 'react-hot-toast'

const HABIT_ICONS = ['🌅', '🧘', '🤸', '🎵', '💻', '📊', '🏫', '💪', '🍳', '📚', '🎯', '🌙', '🏃', '🥗', '💧']
const HABIT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6']

export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'manage'>('today')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '🌅', color: '#6366f1', target_time: '' })

  const { data: todayHabits, isLoading: todayLoading } = useTodayHabits()
  const { data: habits } = useHabits()
  const createHabit = useCreateHabit()
  const logHabit = useLogHabit()
  const deleteHabit = useDeleteHabit()

  const today = getTodayString()

  const handleToggle = (habitId: number, currentlyCompleted: boolean) => {
    logHabit.mutate({ habit_id: habitId, date: today, completed: !currentlyCompleted })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createHabit.mutate(form, {
      onSuccess: () => {
        setForm({ name: '', icon: '🌅', color: '#6366f1', target_time: '' })
        setShowForm(false)
      },
    })
  }

  const completedCount = todayHabits?.filter((h: any) => h.completed).length || 0
  const totalCount = todayHabits?.length || 0
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">⚡ Habit Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Build consistency, one day at a time
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: 24, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Today's Progress</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Plus Jakarta Sans' }}>
              {completedCount}/{totalCount}
              <span style={{ fontSize: 14, color: '#64748b', marginLeft: 8 }}>habits completed</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke={completionPct >= 80 ? '#10b981' : completionPct >= 50 ? '#f59e0b' : '#6366f1'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionPct / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#f1f5f9',
            }}>
              {completionPct}%
            </div>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, display: 'inline-flex' }}>
        <button className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
          Today's Habits
        </button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
          Manage Habits
        </button>
      </div>

      {/* Today's Habits */}
      {activeTab === 'today' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {todayLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
            ))
          ) : (
            todayHabits?.map((item: any, idx: number) => (
              <motion.div
                key={item.habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: item.completed
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 14,
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleToggle(item.habit.id, item.completed)}
                whileHover={{ scale: 1.01 }}
              >
                {/* Checkbox */}
                <div className={`habit-checkbox ${item.completed ? 'completed' : ''}`}>
                  {item.completed && <CheckCircle2 size={14} color="white" />}
                </div>

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.habit.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {item.habit.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    color: item.completed ? '#64748b' : '#e2e8f0',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    fontSize: 15,
                  }}>
                    {item.habit.name}
                  </div>
                  {item.habit.target_time && (
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      Target: {item.habit.target_time}
                    </div>
                  )}
                </div>

                {/* Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18 }}>🔥</span>
                  <span className="streak-badge" style={{ fontSize: 16 }}>{item.habit.streak}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>day streak</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Manage Habits */}
      {activeTab === 'manage' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {habits?.map((habit: any, idx: number) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card"
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${habit.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {habit.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{habit.name}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  Best streak: {habit.longest_streak} days • Current: {habit.streak} days
                </div>
              </div>
              <span className={`badge ${habit.is_active ? 'badge-success' : 'badge-warning'}`}>
                {habit.is_active ? 'Active' : 'Paused'}
              </span>
              <button className="btn-danger" onClick={() => deleteHabit.mutate(habit.id)}>
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Habit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>New Habit</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Habit Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Morning Meditation"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HABIT_ICONS.map(icon => (
                    <button
                      key={icon} type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      style={{
                        width: 40, height: 40, borderRadius: 8, fontSize: 20,
                        border: `2px solid ${form.icon === icon ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                        background: form.icon === icon ? 'rgba(99,102,241,0.15)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {HABIT_COLORS.map(color => (
                    <button
                      key={color} type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: color,
                        border: `3px solid ${form.color === color ? 'white' : 'transparent'}`,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Target Time (optional)</label>
                <input
                  className="input-field"
                  type="time"
                  value={form.target_time}
                  onChange={e => setForm(f => ({ ...f, target_time: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={createHabit.isPending} style={{ flex: 1 }}>
                  {createHabit.isPending ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
