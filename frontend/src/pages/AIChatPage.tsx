import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Brain, Award, AlertCircle, FileText, ChevronRight, Calendar, User, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  sender: 'user' | 'ai'
  text: string
  timestamp: string
}

export default function AIChatPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'briefing' | 'weekly' | 'monthly'>('chat')
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello Bhanu! I'm your Atlas One AI Coach. How can I optimize your performance today?", timestamp: new Date().toLocaleTimeString() }
  ])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Report states
  const [dailyData, setDailyData] = useState<any>(null)
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Pre-fetch reports
    api.get('/api/coach/reports/daily').then(res => setDailyData(res.data)).catch(() => {})
    api.get('/api/coach/reports/weekly').then(res => setWeeklyData(res.data)).catch(() => {})
    api.get('/api/coach/reports/monthly').then(res => setMonthlyData(res.data)).catch(() => {})
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    
    const userMsg: Message = { sender: 'user', text, timestamp: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setLoading(true)

    try {
      const response = await api.post('/api/coach/chat', { message: text })
      const aiMsg: Message = {
        sender: 'ai',
        text: response.data.reply,
        timestamp: new Date(response.data.timestamp).toLocaleTimeString()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      toast.error('AI is offline. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const quickCommands = [
    "Plan my day",
    "What should I study?",
    "What habits are missing today?",
    "Analyze my sleep",
    "Analyze my DSA",
    "How can I improve consistency?"
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header with animated AI Orb */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            🧠 AI Systems Coach
          </h1>
          <p style={{ color: '#7a7a7a', fontSize: 14, marginTop: 4 }}>
            Get context-aware recommendation reports and chat live with your personal growth coach.
          </p>
        </div>

        {/* Animated AI Orb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#8B5CF6', fontWeight: 600 }}>Coach Online</span>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#8B5CF6',
                filter: 'blur(8px)'
              }}
            />
            <div style={{
              position: 'absolute',
              width: 16,
              height: 16,
              left: 6,
              top: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              boxShadow: '0 0 10px #8b5cf6'
            }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, flexWrap: 'wrap' }}>
        {[
          { id: 'chat', label: '💬 Chat Assistant' },
          { id: 'briefing', label: '🌅 Daily Briefing' },
          { id: 'weekly', label: '📊 Weekly Report' },
          { id: 'monthly', label: '🏆 Monthly Milestones' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, height: 580 }}
          >
            {/* Chat Panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Message scrollbox */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      gap: 10,
                      flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: m.sender === 'user' ? 'rgba(79, 124, 255, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: m.sender === 'user' ? '#4F7CFF' : '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {m.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div>
                      <div style={{
                        background: m.sender === 'user' ? '#181818' : 'rgba(139, 92, 246, 0.05)',
                        border: m.sender === 'user' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(139, 92, 246, 0.15)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        color: '#D1D5DB',
                        fontSize: 13,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line'
                      }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize: 10, color: '#7a7a7a', marginTop: 4, textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      AI
                    </div>
                    <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 4 }}>
                      <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
                      <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', animationDelay: '0.2s' }} />
                      <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
                <input
                  className="input-field"
                  placeholder="Type a message or click a quick command..."
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(inputVal)}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={() => sendMessage(inputVal)} disabled={loading} style={{ padding: 12 }}>
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Quick Commands sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Brain size={15} color="#8B5CF6" /> Quick Commands
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => sendMessage(cmd)}
                      className="btn-secondary"
                      style={{ fontSize: 12, textAlign: 'left', padding: '10px 12px', borderRadius: 8, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                    >
                      💡 {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daily Briefing */}
        {activeTab === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: 32 }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <Calendar size={24} color="#8B5CF6" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{dailyData?.title || '🌅 Today\'s Daily briefing'}</h3>
            </div>
            <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.6, marginBottom: 24 }}>
              {dailyData?.summary}
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#FF8A00', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                Recommended Missions for today
              </h4>
              <div style={{ display: 'grid', gap: 10 }}>
                {dailyData?.missions?.map((m: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#D1D5DB' }}>
                    <ChevronRight size={15} color="#FF8A00" style={{ marginTop: 2 }} />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Weekly Report */}
        {activeTab === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: 32 }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <FileText size={24} color="#4F7CFF" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{weeklyData?.title || '📊 Weekly Performance Report'}</h3>
            </div>
            <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.6, marginBottom: 24 }}>
              {weeklyData?.summary}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 24 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#4F7CFF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Consistency highlights
                </h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {weeklyData?.highlights?.map((h: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#D1D5DB' }}>
                      <CheckCircle size={15} color="#22C55E" style={{ marginTop: 2 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'rgba(79, 124, 255, 0.05)',
                border: '1px solid rgba(79, 124, 255, 0.15)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
              }}>
                <div style={{ fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', fontWeight: 700 }}>Weekly Grade</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#4F7CFF', marginTop: 8 }}>{weeklyData?.grade || 'A'}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Monthly Report */}
        {activeTab === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: 32 }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <Award size={24} color="#FFD700" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{monthlyData?.title || '🏆 Monthly Milestone Report'}</h3>
            </div>
            <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.6, marginBottom: 24 }}>
              {monthlyData?.summary}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#FFD700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Unlocked Badges
                </h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {monthlyData?.unlocked_badges?.map((badge: string, idx: number) => (
                    <span key={idx} className="badge" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700', fontSize: 12 }}>
                      🏅 {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 138, 0, 0.05)',
                border: '1px solid rgba(255, 138, 0, 0.15)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
              }}>
                <div style={{ fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', fontWeight: 700 }}>Discipline index</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#FF8A00', marginTop: 8 }}>{monthlyData?.discipline_index || 80}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
