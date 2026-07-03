import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Calendar, Plus, Code2, Layers, CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function PlacementPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [leetcode, setLeetcode] = useState('')
  const [resumeVer, setResumeVer] = useState('')

  const fetchJobs = async () => {
    try {
      const res = await api.get('/career/jobs')
      setJobs(res.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      company: company.trim(),
      role: role.trim(),
      status,
      date_applied: dateApplied,
      notes: notes.trim() || null,
      leetcode_progress: leetcode.trim() || null,
      resume_version: resumeVer.trim() || null
    }

    try {
      await api.post('/career/jobs', payload)
      toast.success('💼 Job application logged! +10 XP')
      setCompany('')
      setRole('')
      setNotes('')
      setLeetcode('')
      setResumeVer('')
      fetchJobs()
    } catch (err) {
      toast.error('Failed to log job application')
    }
  }

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await api.put(`/career/jobs/${jobId}?status=${newStatus}`)
      toast.success('Application status updated')
      fetchJobs()
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (val: string) => {
    switch (val) {
      case 'offered': return '#10b981'
      case 'rejected': return '#ef4444'
      case 'interview': return '#8b5cf6'
      case 'online_test': return '#fbbf24'
      default: return '#3b82f6'
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">💼 Career Placement Tracker</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Log coding progress, manage resume versions, organize interview pipeline stages, and coordinate job applications.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Application Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} color="#6366f1" /> Log Application
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Company Name</label>
                <input
                  placeholder="e.g. Google, Microsoft"
                  className="input-field"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Role</label>
                <input
                  placeholder="e.g. Data Scientist, SWE"
                  className="input-field"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Date Applied</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateApplied}
                  onChange={e => setDateApplied(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Status</label>
                <select
                  className="input-field"
                  style={{ background: '#1a1a2e', height: 42 }}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="applied">Applied 📎</option>
                  <option value="online_test">Online Test 💻</option>
                  <option value="interview">Interview Rounds 🎙️</option>
                  <option value="offered">Job Offered 🎉</option>
                  <option value="rejected">Rejected ❌</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>LeetCode Prep MAJOR</label>
                <input
                  placeholder="e.g. Solved 12 Array problems"
                  className="input-field"
                  value={leetcode}
                  onChange={e => setLeetcode(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Resume version used</label>
                <input
                  placeholder="e.g. Resume_V2_DataScience"
                  className="input-field"
                  value={resumeVer}
                  onChange={e => setResumeVer(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Additional Notes</label>
              <textarea
                placeholder="Interview questions, contacts, salary details..."
                rows={2}
                className="input-field"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifySelf: 'start', gap: 6 }}>
              <Plus size={15} /> Log Application
            </button>
          </form>
        </div>

        {/* Right Side: Active Application Pipelines */}
        <div className="glass-card" style={{ padding: 24, minHeight: 520, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#06b6d4" /> Applications Pipeline
          </h3>

          {loading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 60 }} />
              <div className="skeleton" style={{ height: 60 }} />
            </div>
          ) : jobs.length > 0 ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {jobs.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: 12,
                    borderLeft: `4px solid ${getStatusColor(item.status)}`
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.company}</h4>
                      <span style={{ fontSize: 11, color: '#64748b' }}>• {item.role}</span>
                    </div>
                    
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Applied on: {item.date_applied}</p>
                    
                    {(item.leetcode_progress || item.resume_version) && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {item.leetcode_progress && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                            <Code2 size={10} /> <span>{item.leetcode_progress}</span>
                          </div>
                        )}
                        {item.resume_version && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                            <span>📄 {item.resume_version}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.notes && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>
                        Notes: {item.notes}
                      </div>
                    )}
                  </div>

                  <div>
                    <select
                      className="input-field"
                      style={{ background: '#101020', width: 130, padding: 6, fontSize: 12 }}
                      value={item.status}
                      onChange={e => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="applied">Applied</option>
                      <option value="online_test">Online Test</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered 🎉</option>
                      <option value="rejected">Rejected ❌</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>
              No job applications tracked yet. Set up applications on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
