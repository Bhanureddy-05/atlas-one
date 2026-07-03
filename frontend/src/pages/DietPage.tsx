import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, Droplets, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { useFoodLogs, useDietSummary, useCreateFoodLog, useDeleteFoodLog } from '@/hooks/useApi'
import { getTodayString } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DietPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const { data: logs, isLoading: logsLoading } = useFoodLogs(selectedDate)
  const { data: summary } = useDietSummary(selectedDate)
  const logFood = useCreateFoodLog()
  const deleteFood = useDeleteFoodLog()

  const [showAddForm, setShowAddForm] = useState(false)
  const [activeMeal, setActiveMeal] = useState('breakfast')
  const [form, setForm] = useState({ food_name: '', quantity_g: '100', calories: '', protein_g: '', carbs_g: '', fat_g: '', water_ml: '' })

  const changeDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const handleLogFood = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.food_name && activeMeal !== 'water') {
      toast.error('Food name is required')
      return
    }

    logFood.mutate(
      {
        date: selectedDate,
        meal_type: activeMeal,
        food_name: activeMeal === 'water' ? 'Water' : form.food_name,
        quantity_g: parseFloat(form.quantity_g || '0'),
        calories: parseFloat(form.calories || '0'),
        protein_g: parseFloat(form.protein_g || '0'),
        carbs_g: parseFloat(form.carbs_g || '0'),
        fat_g: parseFloat(form.fat_g || '0'),
        water_ml: activeMeal === 'water' ? parseFloat(form.water_ml || '250') : 0
      },
      {
        onSuccess: () => {
          setForm({ food_name: '', quantity_g: '100', calories: '', protein_g: '', carbs_g: '', fat_g: '', water_ml: '' })
          setShowAddForm(false)
        }
      }
    )
  }

  const targets = { calories: 2000, protein: 150, carbs: 250, fat: 60, water: 3000 }

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Date selector header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="section-title">🥗 Diet & Nutrition Logger</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Track macro targets and stay hydrated daily.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }} onClick={() => changeDate(-1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{selectedDate}</span>
          <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }} onClick={() => changeDate(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Calories', current: summary?.total_calories || 0, target: targets.calories, unit: 'kcal', color: '#f59e0b' },
          { label: 'Protein', current: summary?.total_protein || 0, target: targets.protein, unit: 'g', color: '#10b981' },
          { label: 'Carbs', current: summary?.total_carbs || 0, target: targets.carbs, unit: 'g', color: '#3b82f6' },
          { label: 'Fat', current: summary?.total_fat || 0, target: targets.fat, unit: 'g', color: '#ec4899' },
          { label: 'Water', current: summary?.total_water_ml || 0, target: targets.water, unit: 'ml', color: '#06b6d4' }
        ].map((macro) => {
          const pct = Math.min(Math.round((macro.current / macro.target) * 100), 100)
          return (
            <div key={macro.label} className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{macro.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>
                {Math.round(macro.current)} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>/ {macro.target} {macro.unit}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: macro.color, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Layout Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Meals Logs list */}
        <div style={{ display: 'grid', gap: 20 }}>
          {mealTypes.map(meal => {
            const mealLogs = logs?.filter((l: any) => l.meal_type === meal) || []
            return (
              <div key={meal} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', textTransform: 'capitalize' }}>🍳 {meal}</h3>
                  <button
                    className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => { setActiveMeal(meal); setShowAddForm(true); }}
                  >
                    + Add Food
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {mealLogs.length > 0 ? (
                    mealLogs.map((log: any) => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 10,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{log.food_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            {log.quantity_g}g • P: {log.protein_g}g • C: {log.carbs_g}g • F: {log.fat_g}g
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{log.calories} kcal</span>
                          <button
                            onClick={() => deleteFood.mutate(log.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>No foods logged.</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Water & hydration tracking card */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>💧 Hydration</h3>
              <button
                className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => { setActiveMeal('water'); setShowAddForm(true); }}
              >
                + Log Water
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(6, 182, 212, 0.05)', padding: 14, borderRadius: 10, border: '1px solid rgba(6, 182, 212, 0.1)' }}>
              <Droplets size={24} color="#06b6d4" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{summary?.total_water_ml || 0} ml</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Target: 3,000 ml</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Food Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              Log {activeMeal === 'water' ? 'Water Intake' : `Food in ${activeMeal}`}
            </h3>
            <form onSubmit={handleLogFood}>
              {activeMeal === 'water' ? (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Quantity (ml) *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 250"
                    value={form.water_ml}
                    onChange={e => setForm(f => ({ ...f, water_ml: e.target.value }))}
                    required
                  />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Food Name *</label>
                    <input
                      className="input-field"
                      placeholder="e.g. Scrambled Eggs"
                      value={form.food_name}
                      onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Serving Weight (g)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={form.quantity_g}
                        onChange={e => setForm(f => ({ ...f, quantity_g: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Calories (kcal) *</label>
                      <input
                        type="number"
                        className="input-field"
                        value={form.calories}
                        onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Protein (g)</label>
                      <input
                        type="number" step="0.1"
                        className="input-field"
                        value={form.protein_g}
                        onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Carbs (g)</label>
                      <input
                        type="number" step="0.1"
                        className="input-field"
                        value={form.carbs_g}
                        onChange={e => setForm(f => ({ ...f, carbs_g: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Fat (g)</label>
                      <input
                        type="number" step="0.1"
                        className="input-field"
                        value={form.fat_g}
                        onChange={e => setForm(f => ({ ...f, fat_g: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
