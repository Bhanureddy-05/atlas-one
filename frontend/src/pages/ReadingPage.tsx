import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Clock, Tag, Trash2, Award } from 'lucide-react'
import { useBooks, useReadingStats, useCreateBook, useUpdateBook, useCreateReadingSession } from '@/hooks/useApi'
import toast from 'react-hot-toast'

export default function ReadingPage() {
  const [activeTab, setActiveTab] = useState<string>('reading')
  const { data: books, isLoading: booksLoading } = useBooks()
  const { data: stats } = useReadingStats()

  const createBook = useCreateBook()
  const updateBook = useUpdateBook()
  const logReading = useCreateReadingSession()

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', author: '', genre: '', total_pages: '' })

  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({ book_id: '', pages_read: '', reading_minutes: '', notes: '' })

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.title) {
      toast.error('Title is required')
      return
    }

    createBook.mutate(
      {
        title: addForm.title,
        author: addForm.author || null,
        genre: addForm.genre || null,
        total_pages: parseInt(addForm.total_pages || '0')
      },
      {
        onSuccess: () => {
          setAddForm({ title: '', author: '', genre: '', total_pages: '' })
          setShowAddForm(false)
        }
      }
    )
  }

  const handleLogReading = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logForm.book_id || !logForm.pages_read) {
      toast.error('Book and pages read are required')
      return
    }

    logReading.mutate(
      {
        book_id: parseInt(logForm.book_id),
        date: new Date().toISOString().split('T')[0],
        pages_read: parseInt(logForm.pages_read),
        reading_minutes: parseInt(logForm.reading_minutes || '0'),
        notes: logForm.notes || null
      },
      {
        onSuccess: () => {
          setLogForm({ book_id: '', pages_read: '', reading_minutes: '', notes: '' })
          setShowLogForm(false)
        }
      }
    )
  }

  const handleStatusChange = (id: number, status: string) => {
    updateBook.mutate({
      id,
      data: { status, completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null }
    }, {
      onSuccess: () => {
        toast.success('Book status updated!')
      }
    })
  }

  const filteredBooks = books?.filter((b: any) => {
    if (activeTab === 'all') return true
    return b.status === activeTab
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">📚 Reading Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Organize your library, log reading sessions, and see completion stats.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowLogForm(true)}>
            <Plus size={16} /> Log Reading Session
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Books Completed</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.books_completed || 0} books</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Currently Reading</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.currently_reading || 0} books</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Total Pages Read</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.total_pages_read || 0} pages</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Total Books in Shelf</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{stats?.total_books || 0} books</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, display: 'inline-flex' }}>
        <button className={`tab-btn ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => setActiveTab('reading')}>
          Currently Reading
        </button>
        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed
        </button>
        <button className={`tab-btn ${activeTab === 'want_to_read' ? 'active' : ''}`} onClick={() => setActiveTab('want_to_read')}>
          Want to Read
        </button>
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Books
        </button>
      </div>

      {/* Books Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {booksLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))
        ) : (
          filteredBooks?.map((book: any) => {
            const pct = Math.min(Math.round(book.completion_percent || 0), 100)
            return (
              <motion.div key={book.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{book.title}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>By {book.author || 'Unknown'}</p>

                  {book.genre && <span className="badge badge-info" style={{ display: 'inline-block', marginBottom: 16 }}>{book.genre}</span>}
                </div>

                <div>
                  {book.status !== 'want_to_read' && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                        <span>Progress</span>
                        <span>{book.pages_read} / {book.total_pages} pgs ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: '#84cc16' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <select
                      value={book.status}
                      onChange={(e) => handleStatusChange(book.id, e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#e2e8f0',
                        fontSize: 11,
                        padding: '2px 6px',
                        outline: 'none'
                      }}
                    >
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                      <option value="want_to_read">Want to Read</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Add Book</h3>
            <form onSubmit={handleCreateBook}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Book Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Atomic Habits"
                  value={addForm.title}
                  onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Author</label>
                <input
                  className="input-field"
                  placeholder="e.g. James Clear"
                  value={addForm.author}
                  onChange={e => setAddForm(f => ({ ...f, author: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Total Pages</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 320"
                    value={addForm.total_pages}
                    onChange={e => setAddForm(f => ({ ...f, total_pages: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Genre / Tag</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Self-help"
                    value={addForm.genre}
                    onChange={e => setAddForm(f => ({ ...f, genre: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Reading Session Modal */}
      {showLogForm && (
        <div className="modal-overlay" onClick={() => setShowLogForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Reading Session</h3>
            <form onSubmit={handleLogReading}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Select Book *</label>
                <select
                  className="input-field"
                  value={logForm.book_id}
                  onChange={e => setLogForm(f => ({ ...f, book_id: e.target.value }))}
                  required
                >
                  <option value="">-- Choose Book --</option>
                  {books?.filter((b: any) => b.status === 'reading').map((b: any) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Pages Read *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 20"
                    value={logForm.pages_read}
                    onChange={e => setLogForm(f => ({ ...f, pages_read: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Minutes Spent</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 45"
                    value={logForm.reading_minutes}
                    onChange={e => setLogForm(f => ({ ...f, reading_minutes: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowLogForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
