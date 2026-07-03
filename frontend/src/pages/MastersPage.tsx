import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Award, Calendar, Plus, BookOpen, Clock, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function MastersPage() {
  const [prep, setPrep] = useState<any>(null)
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // University Form State
  const [univName, setUnivName] = useState('')
  const [program, setProgram] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('shortlisted')

  // Prep Form State
  const [ielts, setIelts] = useState('')
  const [gre, setGre] = useState('')
  const [sop, setSop] = useState('draft')
  const [lors, setLors] = useState('0')
  const [visa, setVisa] = useState('')
  const [loan, setLoan] = useState('')

  const fetchData = async () => {
    try {
      const prepRes = await api.get('/career/masters')
      setPrep(prepRes.data)
      setIelts(prepRes.data.ielts_score?.toString() || '')
      setGre(prepRes.data.gre_score?.toString() || '')
      setSop(prepRes.data.sop_status || 'draft')
      setLors(prepRes.data.lor_count?.toString() || '0')
      setVisa(prepRes.data.visa_status || '')
      setLoan(prepRes.data.loan_status || '')

      const univRes = await api.get('/career/universities')
      setUniversities(univRes.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdatePrep = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ielts_score: ielts ? parseFloat(ielts) : null,
      gre_score: gre ? parseInt(gre) : null,
      sop_status: sop,
      lor_count: parseInt(lors) || 0,
      visa_status: visa || null,
      loan_status: loan || null
    }

    try {
      await api.put('/career/masters', payload)
      toast.success('🎓 Master\'s preparation metrics saved!')
      fetchData()
    } catch (err) {
      toast.error('Failed to save metrics')
    }
  }

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      university_name: univName.trim(),
      program: program.trim(),
      deadline: deadline || null,
      status
    }

    try {
      await api.post('/career/universities', payload)
      toast.success('🏫 University shortlisted!')
      setUnivName('')
      setProgram('')
      setDeadline('')
      fetchData()
    } catch (err) {
      toast.error('Failed to add university')
    }
  }

  const handleStatusChange = async (univId: number, newStatus: string) => {
    try {
      await api.put(`/career/universities/${univId}?status=${newStatus}`)
      toast.success('University status updated')
      fetchData()
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🎓 MS Preparation Portal</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Track your IELTS/GRE milestones, LOR/SOP progress, visa pipelines, and shortlist universities.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Exam Scores & Documents */}
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="#6366f1" /> Academic & Exam Prep
            </h3>

            <form onSubmit={handleUpdatePrep} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>IELTS Score</label>
                  <input
                    placeholder="e.g. 7.5"
                    className="input-field"
                    value={ielts}
                    onChange={e => setIelts(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>GRE Score</label>
                  <input
                    placeholder="e.g. 320"
                    className="input-field"
                    value={gre}
                    onChange={e => setGre(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>SOP Status</label>
                  <select
                    className="input-field"
                    style={{ background: '#1a1a2e', height: 42 }}
                    value={sop}
                    onChange={e => setSop(e.target.value)}
                  >
                    <option value="draft">SOP In Draft ✍️</option>
                    <option value="completed">SOP Completed ✅</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>LOR Letters Count</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="input-field"
                    value={lors}
                    onChange={e => setLors(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Visa Process Status</label>
                <input
                  placeholder="e.g. Visa Appointment Booked / Document Checklist Done"
                  className="input-field"
                  value={visa}
                  onChange={e => setVisa(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Education Loan / Funding</label>
                <input
                  placeholder="e.g. Loan Sanctioned / Self-Funded"
                  className="input-field"
                  value={loan}
                  onChange={e => setLoan(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>
                Save Exam & Document Info
              </button>
            </form>
          </div>

          {/* Add University Shortlist */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Shortlist University</h3>
            <form onSubmit={handleAddUniversity} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>University Name</label>
                <input
                  placeholder="e.g. Stanford University"
                  className="input-field"
                  value={univName}
                  onChange={e => setUnivName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Program / Major</label>
                  <input
                    placeholder="e.g. MS in Data Science"
                    className="input-field"
                    value={program}
                    onChange={e => setProgram(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Deadlines</label>
                  <input
                    type="date"
                    className="input-field"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-secondary" style={{ justifySelf: 'start', gap: 6 }}>
                <Plus size={15} /> Shortlist Major
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Shortlisted Universities list */}
        <div className="glass-card" style={{ padding: 24, minHeight: 520, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="#06b6d4" /> Shortlisted Universities
          </h3>

          {loading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 60 }} />
              <div className="skeleton" style={{ height: 60 }} />
            </div>
          ) : universities.length > 0 ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {universities.map((univ) => (
                <div
                  key={univ.id}
                  style={{
                    padding: 18, borderRadius: 12, background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: 12
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{univ.university_name}</h4>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{univ.program}</p>
                    {univ.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#fbbf24', marginTop: 6 }}>
                        <Clock size={12} /> <span>Deadline: {univ.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                      className="input-field"
                      style={{ background: '#101020', width: 130, padding: 6, fontSize: 12 }}
                      value={univ.status}
                      onChange={e => handleStatusChange(univ.id, e.target.value)}
                    >
                      <option value="shortlisted">Shortlisted</option>
                      <option value="applying">Applying</option>
                      <option value="submitted">Submitted</option>
                      <option value="accepted">Accepted 🎉</option>
                      <option value="rejected">Rejected ❌</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>
              No shortlisted universities yet. Add universities on the left to start.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
