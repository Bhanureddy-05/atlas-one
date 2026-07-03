import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Dumbbell, Scale, Activity, Flame, TrendingUp, Shield } from 'lucide-react'
import { useFitnessLogs, useFitnessStats, useBodyMeasurements, useCreateFitnessLog, useCreateBodyMeasurement } from '@/hooks/useApi'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState<'workouts' | 'measurements'>('workouts')
  const { data: logs, isLoading: logsLoading } = useFitnessLogs()
  const { data: stats } = useFitnessStats()
  const { data: measurements } = useBodyMeasurements()

  const createWorkout = useCreateFitnessLog()
  const createMeasurement = useCreateBodyMeasurement()

  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [workoutForm, setWorkoutForm] = useState({ workout_type: 'Push', duration_minutes: '', calories_burned: '', attended_gym: true, notes: '' })

  const [showMeasureForm, setShowMeasureForm] = useState(false)
  const [measureForm, setMeasureForm] = useState({ weight_kg: '', body_fat_percent: '', waist_cm: '', chest_cm: '', arms_cm: '', legs_cm: '' })

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    createWorkout.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        workout_type: workoutForm.workout_type,
        duration_minutes: parseInt(workoutForm.duration_minutes || '0'),
        calories_burned: parseFloat(workoutForm.calories_burned || '0'),
        attended_gym: workoutForm.attended_gym,
        notes: workoutForm.notes || null
      },
      {
        onSuccess: () => {
          setWorkoutForm({ workout_type: 'Push', duration_minutes: '', calories_burned: '', attended_gym: true, notes: '' })
          setShowWorkoutForm(false)
        }
      }
    )
  }

  const handleCreateMeasure = (e: React.FormEvent) => {
    e.preventDefault()
    if (!measureForm.weight_kg) {
      toast.error('Weight is required')
      return
    }

    createMeasurement.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        weight_kg: parseFloat(measureForm.weight_kg),
        body_fat_percent: measureForm.body_fat_percent ? parseFloat(measureForm.body_fat_percent) : null,
        waist_cm: measureForm.waist_cm ? parseFloat(measureForm.waist_cm) : null,
        chest_cm: measureForm.chest_cm ? parseFloat(measureForm.chest_cm) : null,
        arms_cm: measureForm.arms_cm ? parseFloat(measureForm.arms_cm) : null,
        legs_cm: measureForm.legs_cm ? parseFloat(measureForm.legs_cm) : null
      },
      {
        onSuccess: () => {
          setMeasureForm({ weight_kg: '', body_fat_percent: '', waist_cm: '', chest_cm: '', arms_cm: '', legs_cm: '' })
          setShowMeasureForm(false)
        }
      }
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">💪 Fitness Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Log workouts, track progressive overload, monitor weight, and manage body composition.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowMeasureForm(true)}>
            <Scale size={16} /> Log Weight
          </button>
          <button className="btn-primary" onClick={() => setShowWorkoutForm(true)}>
            <Plus size={16} /> Log Workout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Gym Days This Week</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.gym_days_this_week || 0} days</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Gym Days This Month</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.gym_days_this_month || 0} days</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Current Weight</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.latest_measurements?.weight_kg || 'N/A'} kg</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Body Fat</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.latest_measurements?.body_fat_percent || 'N/A'} %</div>
        </div>
      </div>

      {/* Double Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Tabs + Table list */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Tabs */}
          <div className="tab-bar" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
            <button className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`} onClick={() => setActiveTab('workouts')}>
              Workouts History
            </button>
            <button className={`tab-btn ${activeTab === 'measurements' ? 'active' : ''}`} onClick={() => setActiveTab('measurements')}>
              Measurements Logs
            </button>
          </div>

          {activeTab === 'workouts' ? (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Workouts</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {logsLoading ? (
                  <div className="skeleton" style={{ height: 100, borderRadius: 10 }} />
                ) : (
                  logs?.map((log: any) => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge badge-primary">{log.workout_type || 'Workout'}</span>
                          {log.attended_gym && <span className="badge badge-success">Gym</span>}
                        </div>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{log.notes || 'No description notes'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{log.duration_minutes} mins</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{log.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Measurements Logs</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {measurements?.map((m: any) => (
                  <div
                    key={m.id}
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Weight: {m.weight_kg} kg</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        BF: {m.body_fat_percent || 'N/A'}% • Waist: {m.waist_cm || 'N/A'}cm • Arms: {m.arms_cm || 'N/A'}cm
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{m.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Weight Trend Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Weight Trend</h3>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.weight_history || []} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Log Workout Modal */}
      {showWorkoutForm && (
        <div className="modal-overlay" onClick={() => setShowWorkoutForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Workout</h3>
            <form onSubmit={handleCreateWorkout}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Workout Type *</label>
                <select
                  className="input-field"
                  value={workoutForm.workout_type}
                  onChange={e => setWorkoutForm(f => ({ ...f, workout_type: e.target.value }))}
                  required
                >
                  <option value="Push">Push (Chest, Shoulders, Tris)</option>
                  <option value="Pull">Pull (Back, Bis)</option>
                  <option value="Legs">Legs (Quads, Hams, Calves)</option>
                  <option value="Cardio">Cardio / Running</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Rest">Rest / Active Recovery</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Duration (Minutes) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 60"
                  value={workoutForm.duration_minutes}
                  onChange={e => setWorkoutForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Calories Burned</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 400"
                  value={workoutForm.calories_burned}
                  onChange={e => setWorkoutForm(f => ({ ...f, calories_burned: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="attended_gym"
                  checked={workoutForm.attended_gym}
                  onChange={e => setWorkoutForm(f => ({ ...f, attended_gym: e.target.checked }))}
                />
                <label htmlFor="attended_gym" style={{ fontSize: 13, color: '#e2e8f0' }}>Attended Gym</label>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Notes / Exercises Details</label>
                <textarea
                  className="input-field"
                  placeholder="Bench press: 3x10 @ 60kg..."
                  value={workoutForm.notes}
                  onChange={e => setWorkoutForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowWorkoutForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Workout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Measurements Modal */}
      {showMeasureForm && (
        <div className="modal-overlay" onClick={() => setShowMeasureForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Body Weight & Tape</h3>
            <form onSubmit={handleCreateMeasure}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Weight (kg) *</label>
                <input
                  type="number" step="0.1"
                  className="input-field"
                  placeholder="e.g. 72.5"
                  value={measureForm.weight_kg}
                  onChange={e => setMeasureForm(f => ({ ...f, weight_kg: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Body Fat %</label>
                <input
                  type="number" step="0.1"
                  className="input-field"
                  placeholder="e.g. 15.4"
                  value={measureForm.body_fat_percent}
                  onChange={e => setMeasureForm(f => ({ ...f, body_fat_percent: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Waist (cm)</label>
                  <input
                    type="number" step="0.1"
                    className="input-field"
                    value={measureForm.waist_cm}
                    onChange={e => setMeasureForm(f => ({ ...f, waist_cm: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Chest (cm)</label>
                  <input
                    type="number" step="0.1"
                    className="input-field"
                    value={measureForm.chest_cm}
                    onChange={e => setMeasureForm(f => ({ ...f, chest_cm: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Arms (cm)</label>
                  <input
                    type="number" step="0.1"
                    className="input-field"
                    value={measureForm.arms_cm}
                    onChange={e => setMeasureForm(f => ({ ...f, arms_cm: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Legs (cm)</label>
                  <input
                    type="number" step="0.1"
                    className="input-field"
                    value={measureForm.legs_cm}
                    onChange={e => setMeasureForm(f => ({ ...f, legs_cm: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowMeasureForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Logs</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
