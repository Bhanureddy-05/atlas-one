import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Link as LinkIcon, Code2, Award, BookOpen, Layers } from 'lucide-react'
import { useDSATopics, useDSAStats, useDSAProblems, useCreateDSAProblem, useUpdateDSAProblem } from '@/hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function DSAPage() {
  const { data: topics, isLoading: topicsLoading } = useDSATopics()
  const { data: stats } = useDSAStats()
  const { data: problems } = useDSAProblems()
  const createProblem = useCreateDSAProblem()
  const updateProblem = useUpdateDSAProblem()

  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ topic_id: '', title: '', difficulty: 'easy', leetcode_url: '', company_tags: '' })

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.topic_id || !form.title) {
      toast.error('Please fill topic and title')
      return
    }

    createProblem.mutate(
      {
        topic_id: parseInt(form.topic_id),
        title: form.title,
        difficulty: form.difficulty,
        leetcode_url: form.leetcode_url || null,
        company_tags: form.company_tags || null
      },
      {
        onSuccess: () => {
          setForm({ topic_id: '', title: '', difficulty: 'easy', leetcode_url: '', company_tags: '' })
          setShowAddForm(false)
        }
      }
    )
  }

  const handleSolve = (id: number) => {
    updateProblem.mutate({
      id,
      data: { status: 'solved', solved_date: new Date().toISOString().split('T')[0] }
    }, {
      onSuccess: () => {
        toast.success('Problem solved!')
      }
    })
  }

  // Filter problems
  const filteredProblems = problems?.filter((p: any) => {
    if (selectedTopic && p.topic_id !== parseInt(selectedTopic)) return false
    return true
  })

  // Prepare chart data
  const chartData = stats?.by_topic || []

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">💻 Data Structures & Algorithms</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Log and review DSA problems on LeetCode across essential topics.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Add Solved Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card" style={{ '--card-accent': 'linear-gradient(90deg, #6366f1, #a78bfa)' } as any}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Total Solved</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{stats?.total_solved || 0}</div>
        </div>
        <div className="metric-card" style={{ '--card-accent': 'linear-gradient(90deg, #10b981, #34d399)' } as any}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Easy Solved</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{stats?.easy_solved || 0}</div>
        </div>
        <div className="metric-card" style={{ '--card-accent': 'linear-gradient(90deg, #f59e0b, #fbbf24)' } as any}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Medium Solved</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24' }}>{stats?.medium_solved || 0}</div>
        </div>
        <div className="metric-card" style={{ '--card-accent': 'linear-gradient(90deg, #ef4444, #f87171)' } as any}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Hard Solved</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171' }}>{stats?.hard_solved || 0}</div>
        </div>
      </div>

      {/* Double Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Topic list & Problems */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Topics Grid */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Topics Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {topicsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
                ))
              ) : (
                topics?.map((topic: any) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(selectedTopic === String(topic.id) ? '' : String(topic.id))}
                    style={{
                      background: selectedTopic === String(topic.id) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${selectedTopic === String(topic.id) ? '#6366f1' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: 10,
                      padding: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{topic.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        E: {topic.easy_solved} • M: {topic.medium_solved} • H: {topic.hard_solved}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>
                      {topic.easy_solved + topic.medium_solved + topic.hard_solved}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Solved Problems List */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Problems History</h3>
              <span className="badge badge-primary">Showing {filteredProblems?.length || 0}</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredProblems?.map((p: any) => {
                const topic = topics?.find((t: any) => t.id === p.topic_id)
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge ${p.difficulty === 'easy' ? 'diff-easy' : p.difficulty === 'medium' ? 'diff-medium' : 'diff-hard'}`}>
                        {p.difficulty}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{topic?.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.leetcode_url && (
                        <a href={p.leetcode_url} target="_blank" rel="noreferrer" style={{ color: '#06b6d4' }}>
                          <LinkIcon size={16} />
                        </a>
                      )}
                      {p.status !== 'solved' ? (
                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleSolve(p.id)}>
                          Solve
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ Solved</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Recharts Stacked Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Topic Distribution</h3>
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#475569" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="easy" stackId="a" fill="#10b981" />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                <Bar dataKey="hard" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Add Problem Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Add Solved DSA Problem</h3>
            <form onSubmit={handleAddProblem}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Select Topic *</label>
                <select
                  className="input-field"
                  value={form.topic_id}
                  onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))}
                  required
                >
                  <option value="">-- Choose Topic --</option>
                  {topics?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Problem Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Two Sum"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Difficulty</label>
                <select
                  className="input-field"
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>LeetCode Link</label>
                <input
                  className="input-field"
                  placeholder="https://leetcode.com/problems/..."
                  value={form.leetcode_url}
                  onChange={e => setForm(f => ({ ...f, leetcode_url: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Company Tags (comma separated)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Amazon, Google"
                  value={form.company_tags}
                  onChange={e => setForm(f => ({ ...f, company_tags: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
