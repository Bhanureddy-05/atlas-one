import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, CheckCircle2, Trash2, Heart, BookOpen, Dumbbell, Briefcase, Zap } from 'lucide-react'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useApi'
import toast from 'react-hot-toast'

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const { data: goals, isLoading: goalsLoading } = useGoals(activeTab)
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'study', target_value: '', unit: '' })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return

    createGoal.mutate(
      {
        title: form.title,
        goal_type: activeTab,
        category: form.category,
        target_value: parseFloat(form.target_value || '0'),
        unit: form.unit || null
      },
      {
        onSuccess: () => {
          setForm({ title: '', category: 'study', target_value: '', unit: '' })
          setShowAddForm(false)
        }
      }
    )
  }

  const handleIncrement = (goal: any) => {
    const nextVal = (goal.current_value || 0) + 1
    const isComp = nextVal >= goal.target_value
    updateGoal.mutate({
      id: goal.id,
      data: {
        current_value: nextVal,
        is_completed: isComp,
        completed_date: isComp ? new Date().toISOString().split('T')[0] : null
      }
    })
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'study': return <BookOpen size={16} />
      case 'fitness': return <Dumbbell size={16} />
      case 'career': return <Briefcase size={16} />
      case 'habits': return <Zap size={16} />
      default: return <Target size={16} />
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">🎯 Goals Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Define actionable targets and check them off as you grow.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, display: 'inline-flex' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
          <button
            key={type}
            className={`tab-btn ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type as any)}
            style={{ textTransform: 'capitalize' }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div style={{ display: 'grid', gap: 14 }}>
        {goalsLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))
        ) : goals?.length > 0 ? (
          goals.map((goal: any) => {
            const pct = Math.min(Math.round(goal.completion_percent || 0), 100)
            return (
              <motion.div
                key={goal.id}
                className="glass-card"
                style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{
                  padding: 10, borderRadius: 10,
                  background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getCategoryIcon(goal.category)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: goal.is_completed ? '#64748b' : '#e2e8f0', textDecoration: goal.is_completed ? 'line-through' : 'none' }}>
                      {goal.title}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {goal.current_value} / {goal.target_value} {goal.unit || ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', minWidth: 30 }}>{pct}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!goal.is_completed && (
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleIncrement(goal)}>
                      +1
                    </button>
                  )}
                  <button
                    onClick={() => deleteGoal.mutate(goal.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No goals found for this period. Create one!
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>New Goal ({activeTab})</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Goal Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Solve 50 DSA problems"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Category</label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                    <option value="reading">Reading</option>
                    <option value="habits">Habits</option>
                    <option value="career">Career / Placement</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Target Value</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 50"
                    value={form.target_value}
                    onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Unit</label>
                <input
                  className="input-field"
                  placeholder="e.g. problems, hours, kg"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
