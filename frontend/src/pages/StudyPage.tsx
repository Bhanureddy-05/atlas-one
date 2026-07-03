import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Plus, Trophy, Clock, CheckCircle } from 'lucide-react'
import { useStudyTopics, useStudySessions, useCreateStudyTopic, useCreateStudySession, useUpdateStudyTopic } from '@/hooks/useApi'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<'topics' | 'log' | 'overview'>('topics')
  const { data: topics, isLoading: topicsLoading } = useStudyTopics()
  const { data: sessions } = useStudySessions()
  const createTopic = useCreateStudyTopic()
  const createSession = useCreateStudySession()
  const updateTopic = useUpdateStudyTopic()

  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicCat, setNewTopicCat] = useState('Python')

  const [sessionTopicId, setSessionTopicId] = useState('')
  const [sessionHours, setSessionHours] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopicName.trim()) return
    createTopic.mutate(
      { name: newTopicName, category: newTopicCat, notes: '' },
      {
        onSuccess: () => {
          setNewTopicName('')
          setShowAddTopic(false)
        }
      }
    )
  }

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionTopicId || !sessionHours) {
      toast.error('Please select topic and fill hours')
      return
    }

    createSession.mutate(
      {
        topic_id: parseInt(sessionTopicId),
        hours: parseFloat(sessionHours),
        date: new Date().toISOString().split('T')[0],
        notes: sessionNotes
      },
      {
        onSuccess: () => {
          setSessionHours('')
          setSessionNotes('')
          toast.success('Study session logged successfully!')
        }
      }
    )
  }

  const handleProgressChange = (topicId: number, progressPct: number) => {
    updateTopic.mutate({
      id: topicId,
      data: { completion_percent: progressPct }
    })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">📊 Data Science Study Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Track learning progress across Python, ML, Deep Learning, NLP and projects.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddTopic(true)}>
          <Plus size={16} /> Add Study Topic
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, display: 'inline-flex' }}>
        <button className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
          Study Topics
        </button>
        <button className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>
          Log Session
        </button>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Revision & Stats
        </button>
      </div>

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {topicsLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
            ))
          ) : (
            topics?.map((topic: any) => (
              <motion.div key={topic.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 6, display: 'inline-block' }}>{topic.category}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{topic.name}</h3>
                  </div>
                  {/* Progress Ring */}
                  <div style={{ position: 'relative', width: 50, height: 50 }}>
                    <svg width="50" height="50" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <circle
                        cx="25" cy="25" r="20" fill="none"
                        stroke="#6366f1" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - topic.completion_percent / 100)}`}
                        strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '25px 25px' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {Math.round(topic.completion_percent)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {topic.total_hours} hrs</span>
                  {topic.last_revised && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Revised {topic.last_revised}</span>}
                </div>

                {/* Quick Slider for completion */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                    <span>Update Progress</span>
                    <span>{Math.round(topic.completion_percent)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={topic.completion_percent}
                    onChange={(e) => handleProgressChange(topic.id, parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Log Session Tab */}
      {activeTab === 'log' && (
        <div className="glass-card" style={{ padding: 28, maxWidth: 600, margin: '0 auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Focused Study Session</h3>
          <form onSubmit={handleCreateSession}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Select Study Topic *</label>
              <select
                className="input-field"
                value={sessionTopicId}
                onChange={e => setSessionTopicId(e.target.value)}
                required
              >
                <option value="">-- Choose Topic --</option>
                {topics?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Duration (Hours) *</label>
              <input
                type="number" step="0.1"
                className="input-field"
                placeholder="e.g. 1.5"
                value={sessionHours}
                onChange={e => setSessionHours(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Session Notes</label>
              <textarea
                className="input-field"
                placeholder="What did you learn? key concepts covered..."
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                rows={4}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Log Study Hours
            </button>
          </form>
        </div>
      )}

      {/* Revision & Stats Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Study Progress over time line chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Daily Study Trend</h3>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessions?.slice(0, 15).reverse() || []}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Line type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={2.5} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sessions List */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Recent Sessions History</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {sessions?.slice(0, 10).map((s: any) => {
                const topic = topics?.find((t: any) => t.id === s.topic_id)
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderRadius: 10, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{topic?.name || 'Study Topic'}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.notes || 'No description notes'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{s.hours} hrs</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.date}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopic && (
        <div className="modal-overlay" onClick={() => setShowAddTopic(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>New Study Topic</h3>
            <form onSubmit={handleCreateTopic}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Topic Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Pandas DataFrames"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Category *</label>
                <select
                  className="input-field"
                  value={newTopicCat}
                  onChange={e => setNewTopicCat(e.target.value)}
                  required
                >
                  <option value="Python">Python</option>
                  <option value="Statistics">Statistics</option>
                  <option value="EDA">EDA</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="NLP">NLP</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddTopic(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Create Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
