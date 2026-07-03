import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Lightbulb, Quote, Search, Trash2, Plus, Calendar, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('note')
  const [content, setContent] = useState('')

  const fetchItems = async () => {
    try {
      const url = filterType === 'all' ? '/knowledge/' : `/knowledge/?content_type=${filterType}`
      const res = await api.get(url)
      setItems(res.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [filterType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const payload = {
      title: title.trim(),
      content_type: contentType,
      content: content.trim()
    }

    try {
      await api.post('/knowledge/', payload)
      toast.success('🧠 Knowledge item indexed! AI summary generated.')
      setTitle('')
      setContent('')
      fetchItems()
    } catch (err) {
      toast.error('Failed to save knowledge item')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/knowledge/${id}`)
      toast.success('Note deleted')
      fetchItems()
    } catch (e) {
      toast.error('Failed to delete note')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea': return <Lightbulb size={16} color="#fbbf24" />
      case 'quote': return <Quote size={16} color="#38bdf8" />
      case 'research': return <Sparkles size={16} color="#c084fc" />
      default: return <BookOpen size={16} color="#818cf8" />
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🧠 Personal Knowledge Vault</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Index ideas, research logs, quotes, and lecture notes. BHANOVA automatically compiles local AI summaries.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
        {['all', 'note', 'idea', 'research', 'quote'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              border: 'none',
              background: filterType === type ? '#6366f1' : 'rgba(255,255,255,0.03)',
              color: filterType === type ? 'white' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            {type}s
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Create Note */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Index New Entry</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Title / Subject</label>
                <input
                  placeholder="e.g. Backpropagation Math"
                  className="input-field"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Type</label>
                <select
                  className="input-field"
                  style={{ background: '#1a1a2e', height: 42 }}
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                >
                  <option value="note">Study Note 📝</option>
                  <option value="idea">Idea 💡</option>
                  <option value="research">Research Reference 🔬</option>
                  <option value="quote">Quote 💬</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Content / Notes</label>
              <textarea
                placeholder="Write your research paper abstracts, brainstorm notes, or code blocks here..."
                rows={6}
                className="input-field"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifySelf: 'start', gap: 6 }}>
              <Plus size={15} /> Index Vault
            </button>
          </form>
        </div>

        {/* Right Side: Index list */}
        <div className="glass-card" style={{ padding: 24, minHeight: 480, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Knowledge Index</h3>

          {loading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 100 }} />
              <div className="skeleton" style={{ height: 100 }} />
            </div>
          ) : items.length > 0 ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 18, borderRadius: 12, background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getTypeIcon(item.content_type)}
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.title}</span>
                      <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase' }}>• {item.content_type}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: 12 }}>
                    {item.content}
                  </p>

                  {item.ai_summary && (
                    <div style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.04)',
                      border: '1px solid rgba(99, 102, 241, 0.12)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#818cf8',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'start'
                    }}>
                      <Sparkles size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong>AI Summary:</strong> {item.ai_summary}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>
              No items found in this section. Create some notes on the left!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
