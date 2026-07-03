import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Smile, AlertCircle, Plus, Calendar, Moon, Sun, Award } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [entryType, setEntryType] = useState('morning')
  const [mood, setMood] = useState(3)
  const [gratitude1, setGratitude1] = useState('')
  const [gratitude2, setGratitude2] = useState('')
  const [gratitude3, setGratitude3] = useState('')
  const [reflection, setReflection] = useState('')
  const [lessonsLearned, setLessonsLearned] = useState('')
  
  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal/')
      setEntries(res.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      date,
      entry_type: entryType,
      mood,
      gratitude_1: gratitude1 || null,
      gratitude_2: gratitude2 || null,
      gratitude_3: gratitude3 || null,
      reflection: reflection || null,
      lessons_learned: lessonsLearned || null
    }

    try {
      await api.post('/journal/', payload)
      toast.success('📝 Journal entry saved! +15 XP')
      // Reset form
      setGratitude1('')
      setGratitude2('')
      setGratitude3('')
      setReflection('')
      setLessonsLearned('')
      fetchEntries()
    } catch (err) {
      toast.error('Failed to save journal entry')
    }
  }

  const getMoodEmoji = (val: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '🤩']
    return emojis[val - 1] || '😐'
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📝 Mindful Journal</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Record your morning intentions, evening reflections, mood history, and lessons learned.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: New Entry Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>New Daily Log</h3>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 8 }}>
              <button
                onClick={() => setEntryType('morning')}
                style={{
                  border: 'none', background: entryType === 'morning' ? '#6366f1' : 'transparent',
                  color: entryType === 'morning' ? 'white' : '#64748b', padding: '6px 12px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <Sun size={12} /> Morning
              </button>
              <button
                onClick={() => setEntryType('night')}
                style={{
                  border: 'none', background: entryType === 'night' ? '#6366f1' : 'transparent',
                  color: entryType === 'night' ? 'white' : '#64748b', padding: '6px 12px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <Moon size={12} /> Night
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  Mood: {getMoodEmoji(mood)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="input-field"
                  style={{ height: 38, padding: 0 }}
                  value={mood}
                  onChange={e => setMood(parseInt(e.target.value))}
                />
              </div>
            </div>

            {entryType === 'morning' ? (
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  Three things I am grateful for today:
                </label>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    placeholder="1. e.g. Waking up early at 4:30 AM"
                    className="input-field"
                    value={gratitude1}
                    onChange={e => setGratitude1(e.target.value)}
                  />
                  <input
                    placeholder="2. e.g. A hot cup of green tea"
                    className="input-field"
                    value={gratitude2}
                    onChange={e => setGratitude2(e.target.value)}
                  />
                  <input
                    placeholder="3. e.g. High focus levels during study session"
                    className="input-field"
                    value={gratitude3}
                    onChange={e => setGratitude3(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  Reflection / Night Journal
                </label>
                <textarea
                  placeholder="How did today go? What went well and what could have been better?"
                  rows={4}
                  className="input-field"
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                Lessons Learned / Daily Insights
              </label>
              <textarea
                placeholder="What did you learn today? (About yourself, career, study, or habits)"
                rows={2}
                className="input-field"
                value={lessonsLearned}
                onChange={e => setLessonsLearned(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifySelf: 'start', gap: 6 }}>
              <Plus size={15} /> Save Daily Entry
            </button>
          </form>
        </div>

        {/* Right Side: Log History */}
        <div className="glass-card" style={{ padding: 24, maxHeight: 580, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={18} color="#06b6d4" /> Entry History
          </h3>

          {loading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 60 }} />
              <div className="skeleton" style={{ height: 60 }} />
            </div>
          ) : entries.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {entries.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                        {item.entry_type === 'morning' ? '🌅 Morning Log' : '🌙 Evening Log'}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{item.date}</span>
                    </div>
                    <span style={{ fontSize: 14 }}>{getMoodEmoji(item.mood)}</span>
                  </div>

                  {item.entry_type === 'morning' ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', display: 'grid', gap: 4 }}>
                      <strong>Gratitudes:</strong>
                      {item.gratitude_1 && <div>• {item.gratitude_1}</div>}
                      {item.gratitude_2 && <div>• {item.gratitude_2}</div>}
                      {item.gratitude_3 && <div>• {item.gratitude_3}</div>}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      <strong>Reflection:</strong> {item.reflection}
                    </p>
                  )}

                  {item.lessons_learned && (
                    <div style={{
                      marginTop: 10, borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: 8,
                      fontSize: 12, color: '#818cf8', display: 'flex', gap: 6, alignItems: 'center'
                    }}>
                      <Award size={13} /> <span>{item.lessons_learned}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              No journal entries recorded. Write your first reflection today!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
