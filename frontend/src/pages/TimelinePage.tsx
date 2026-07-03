import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Calendar, Trash2, Scale, LayoutGrid, FileText, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function TimelinePage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Upload Form State
  const [file, setFile] = useState<File | null>(null)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  // Comparison State
  const [leftPhotoIdx, setLeftPhotoIdx] = useState<number>(0)
  const [rightPhotoIdx, setRightPhotoIdx] = useState<number>(0)
  const [showComparison, setShowComparison] = useState(false)

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/progress-photo/')
      setPhotos(res.data)
      setLoading(false)
      
      // Auto-set comparison indices
      if (res.data.length > 1) {
        setLeftPhotoIdx(res.data.length - 1) // oldest
        setRightPhotoIdx(0) // newest
      }
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select an image file to upload')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('date_str', date)
    if (weight) formData.append('weight_kg', weight)
    if (notes) formData.append('notes', notes)

    const toastId = toast.loading('Uploading transformation photo...')
    try {
      await api.post('/progress-photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('📷 Progress photo uploaded! +10 XP', { id: toastId })
      setFile(null)
      setWeight('')
      setNotes('')
      fetchPhotos()
    } catch (err) {
      toast.error('Failed to upload photo', { id: toastId })
    }
  }

  // Weight Trend Data
  const weightTrendData = [...photos]
    .reverse()
    .filter(p => p.weight_kg)
    .map(p => ({
      date: p.date,
      weight: p.weight_kg
    }))

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📷 Progress Timeline</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Upload fitness check-in photos, compare body transformation timelines, and track correlating weight metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Upload Form & Weight Trend */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Upload Progress Form */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Camera size={18} color="#6366f1" /> Log Progress Photo
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Photo File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: 8, color: '#e2e8f0', width: '100%', fontSize: 13
                  }}
                  required
                />
              </div>

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
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 72.0"
                    className="input-field"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Reflections / Notes</label>
                <input
                  placeholder="e.g. Morning checkin. Core definition improved."
                  className="input-field"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>
                Upload Photo Record
              </button>
            </form>
          </div>

          {/* Weight Correlation chart */}
          {weightTrendData.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Scale size={16} color="#06b6d4" /> Weight Progression Correlation
              </h3>
              <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightTrendData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11 }} />
                    <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline Transformation Gallery */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutGrid size={18} color="#818cf8" /> Transformation Timeline
            </h3>

            {photos.length >= 2 && (
              <button
                className="btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px', gap: 4 }}
                onClick={() => setShowComparison(!showComparison)}
              >
                ⚖️ {showComparison ? 'Show Gallery' : 'Side-by-Side Compare'}
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="skeleton" style={{ height: 260 }} />
              <div className="skeleton" style={{ height: 260 }} />
            </div>
          ) : showComparison && photos.length >= 2 ? (
            /* Side-by-side comparison screen */
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Left comparison image */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>BEFORE: {photos[leftPhotoIdx]?.date}</div>
                  <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#10101a' }}>
                    <img src={photos[leftPhotoIdx]?.photo_path} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  {photos[leftPhotoIdx]?.weight_kg && <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700, marginTop: 8 }}>{photos[leftPhotoIdx]?.weight_kg} kg</div>}
                  <select
                    className="input-field"
                    style={{ background: '#1a1a2e', fontSize: 12, marginTop: 10, padding: 6 }}
                    value={leftPhotoIdx}
                    onChange={e => setLeftPhotoIdx(parseInt(e.target.value))}
                  >
                    {photos.map((p, idx) => (
                      <option key={p.id} value={idx}>{p.date} ({p.weight_kg || 'No'} kg)</option>
                    ))}
                  </select>
                </div>

                {/* Right comparison image */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>AFTER: {photos[rightPhotoIdx]?.date}</div>
                  <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#10101a' }}>
                    <img src={photos[rightPhotoIdx]?.photo_path} alt="After" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  {photos[rightPhotoIdx]?.weight_kg && <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700, marginTop: 8 }}>{photos[rightPhotoIdx]?.weight_kg} kg</div>}
                  <select
                    className="input-field"
                    style={{ background: '#1a1a2e', fontSize: 12, marginTop: 10, padding: 6 }}
                    value={rightPhotoIdx}
                    onChange={e => setRightPhotoIdx(parseInt(e.target.value))}
                  >
                    {photos.map((p, idx) => (
                      <option key={p.id} value={idx}>{p.date} ({p.weight_kg || 'No'} kg)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : photos.length > 0 ? (
            /* Standard Grid Timeline View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {photos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column'
                  }}
                >
                  <div style={{ height: 200, width: '100%', background: '#10101e', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <img
                      src={p.photo_path}
                      alt={`Progress ${p.date}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => {
                        // Fallback image representation
                        e.target.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
                      }}
                    />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{p.date}</span>
                      {p.weight_kg && <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 700 }}>{p.weight_kg} kg</span>}
                    </div>
                    {p.notes && (
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {p.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>
              No progress photos logged yet. Take your first transformation picture on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
