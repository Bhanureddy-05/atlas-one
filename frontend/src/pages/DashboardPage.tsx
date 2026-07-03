import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard, useTodayHabits, useLogHabit } from '@/hooks/useApi'
import { formatToday, getTodayString } from '@/lib/utils'
import {
  BookOpen, Flame, Scale, Moon, Zap, Target, Dumbbell, Trophy, Plus,
  ChevronRight, Calendar, Sparkles, TrendingUp, AlertCircle, BrainCircuit, CheckCircle
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: summary, isLoading: summaryLoading } = useDashboard()
  const { data: todayHabits, isLoading: habitsLoading } = useTodayHabits()
  const logHabit = useLogHabit()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 110,
        damping: 15
      }
    }
  }

  const quotesList = [
    { text: "The secret of getting ahead is getting started.", category: "discipline" },
    { text: "Small progress every day becomes massive success.", category: "consistency" },
    { text: "Discipline creates freedom.", category: "discipline" },
    { text: "Consistency beats motivation.", category: "consistency" },
    { text: "The future depends on what you do today.", category: "success" },
    { text: "Physical conditioning is the core of high-level resilience.", category: "fitness" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", category: "learning" }
  ]
  const currentQuoteIndex = new Date().getDate() % quotesList.length
  const dailyQuoteObj = quotesList[currentQuoteIndex]

  const [savedQuotes, setSavedQuotes] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('lifeos_saved_quotes') || '[]')
  })
  const [showHistory, setShowHistory] = useState(false)

  const handleToggleFavoriteQuote = (quoteText: string) => {
    let updated: string[]
    if (savedQuotes.includes(quoteText)) {
      updated = savedQuotes.filter(q => q !== quoteText)
      toast.success('Removed quote from favorites')
    } else {
      updated = [...savedQuotes, quoteText]
      toast.success('Added quote to favorites! ⭐')
    }
    setSavedQuotes(updated)
    localStorage.setItem('lifeos_saved_quotes', JSON.stringify(updated))
  }

  const [greeting, setGreeting] = useState('Welcome')
  const [coachData, setCoachData] = useState<any>(null)
  const [coachLoading, setCoachLoading] = useState(true)

  useEffect(() => {
    api.get('/coach/insights')
      .then(res => {
        setCoachData(res.data)
        setCoachLoading(false)
      })
      .catch(() => {
        setCoachLoading(false)
      })
  }, [])

  useEffect(() => {
    const hrs = new Date().getHours()
    if (hrs < 12) setGreeting('Good morning')
    else if (hrs < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const handleToggleHabit = (habitId: number, currentlyCompleted: boolean) => {
    logHabit.mutate(
      { habit_id: habitId, date: getTodayString(), completed: !currentlyCompleted },
      {
        onSuccess: () => {
          toast.success('Habit updated!')
        }
      }
    )
  }

  if (summaryLoading || habitsLoading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 300, height: 40 }} />
          <div className="skeleton" style={{ width: 120, height: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Sunrise Gradient Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(79, 124, 255, 0.1) 100%)',
          border: '1px solid rgba(255, 138, 0, 0.12)',
          borderRadius: 16,
          padding: '24px 32px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 8px 32px rgba(255, 138, 0, 0.04)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="section-title" style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0 }}>
              Good Morning, <span className="gradient-text">{summary?.user?.name || 'Bhanu'}</span>!
            </h1>
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{ fontSize: 28, display: 'inline-block' }}
            >
              🌅
            </motion.span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#FF8A00" /> {formatToday()} — Consistency is your superpower!
          </p>
        </div>

        {/* Quick Actions inside Hero */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => navigate('/planner')} style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}>
            <Plus size={16} /> Daily Planner
          </button>
          <button className="btn-primary" onClick={() => navigate('/diet')} style={{ background: 'linear-gradient(135deg, #4F7CFF, #8B5CF6)', border: 'none' }}>
            <Plus size={16} /> Log Diet
          </button>
        </div>
      </motion.div>

      {/* Gamification HUD Bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: 12,
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>🧙</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
              Level {summary?.user?.level || 1} Sage
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              XP: {summary?.user?.xp || 0} / {(summary?.user?.level || 1) * 100} to next level
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div style={{ flex: 1, maxWidth: 300, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', margin: '0 16px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((summary?.user?.xp || 0) / ((summary?.user?.level || 1) * 100)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              borderRadius: 3
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: 12 }}>
            🛡️ Shields: {summary?.user?.streak_shields || 0}
          </span>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: 12 }}>
            📈 Life Score: {summary?.life_score || 0}%
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}
      >
        {/* Study Hours Card */}
        <motion.div
          className="metric-card"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, rotate: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Study Hours</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{summary?.today_study_hours || 0} hrs</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>This week: {summary?.week_study_hours || 0} hrs</div>
        </motion.div>

        {/* Calories Card */}
        <motion.div
          className="metric-card"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, rotate: 0.5 }}
          whileTap={{ scale: 0.97 }}
          style={{ '--card-accent': 'linear-gradient(90deg, #f97316, #ef4444)' } as any}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Calories Logged</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{summary?.today_calories || 0} kcal</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Target: 2,000 kcal</div>
        </motion.div>

        {/* Weight Card */}
        <motion.div
          className="metric-card"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, rotate: 0.5 }}
          whileTap={{ scale: 0.97 }}
          style={{ '--card-accent': 'linear-gradient(90deg, #22c55e, #3b82f6)' } as any}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Current Weight</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <Scale size={18} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{summary?.latest_weight ? `${summary.latest_weight} kg` : 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Fitness goal: Lean Bulk</div>
        </motion.div>

        {/* Sleep Card */}
        <motion.div
          className="metric-card"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, rotate: 0.5 }}
          whileTap={{ scale: 0.97 }}
          style={{ '--card-accent': 'linear-gradient(90deg, #8b5cf6, #d946ef)' } as any}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Sleep Quality</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Moon size={18} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{summary?.sleep_hours ? `${summary.sleep_hours} hrs` : 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Quality: {summary?.sleep_quality ? '★'.repeat(summary.sleep_quality) + '☆'.repeat(5 - summary.sleep_quality) : 'Not Logged'}
          </div>
        </motion.div>

        {/* Streaks Card */}
        <motion.div
          className="metric-card"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, rotate: 0.5 }}
          whileTap={{ scale: 0.97 }}
          style={{ '--card-accent': 'linear-gradient(90deg, #ef4444, #f97316)' } as any}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Consistency Streak</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Trophy size={18} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            🔥 <span className="streak-badge">{summary?.current_streak || 0} Days</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Consistency: {summary?.habit_consistency_percent || 0}%</div>
        </motion.div>
      </motion.div>

      {/* Double Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Weekly Study Chart & AI Coach */}
        <div style={{ display: 'grid', gap: 24 }}>
          
          {/* AI Coach Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.18)',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <BrainCircuit size={20} color="#818cf8" />
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#f1f5f9' }}>
                AI Coach Insights
              </h3>
            </div>
            
            {coachLoading ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '90%' }} />
                <div className="skeleton" style={{ height: 16, width: '80%' }} />
                <div className="skeleton" style={{ height: 16, width: '60%' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Insights / Trends */}
                {coachData?.insights?.length > 0 && (
                  <div>
                    {coachData.insights.map((ins: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        style={{ display: 'flex', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}
                      >
                        <TrendingUp size={15} color="#06b6d4" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{ins}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {coachData?.recommendations?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Recommendations
                    </h4>
                    {coachData.recommendations.map((rec: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx + 3) * 0.05, duration: 0.3 }}
                        style={{ display: 'flex', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}
                      >
                        <AlertCircle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Strengths */}
                {coachData?.strengths?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Strengths
                    </h4>
                    {coachData.strengths.map((str: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx + 6) * 0.05, duration: 0.3 }}
                        style={{ display: 'flex', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}
                      >
                        <CheckCircle size={15} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{str}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Daily Tip */}
                {coachData?.daily_tip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#94a3b8',
                      fontStyle: 'italic'
                    }}
                  >
                    💡 {coachData.daily_tip}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#f1f5f9' }}>Weekly Study hours</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                <TrendingUp size={16} /> Tracked Time
              </div>
            </div>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.weekly_study_data || []} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.3)' }} />
                  <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#studyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Motivational Quote Card */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(79, 124, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(79, 124, 255, 0.15)',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4F7CFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Daily Motivation • {dailyQuoteObj.category}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleToggleFavoriteQuote(dailyQuoteObj.text)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: savedQuotes.includes(dailyQuoteObj.text) ? '#FFD700' : '#7a7a7a' }}
                >
                  ★
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', fontSize: 11 }}
                >
                  {showHistory ? 'Hide History' : 'History'}
                </button>
              </div>
            </div>

            <motion.p
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontStyle: 'italic', fontSize: 15, color: '#FFFFFF', lineHeight: 1.6, margin: 0 }}
            >
              "{dailyQuoteObj.text}"
            </motion.p>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}
                >
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#FFD700', marginBottom: 8 }}>Saved Favorites & Quote History</h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {savedQuotes.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#7a7a7a' }}>No favorite quotes saved yet. Click the star icon to save!</div>
                    ) : (
                      savedQuotes.map((q, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>"{q}"</span>
                          <button
                            onClick={() => handleToggleFavoriteQuote(q)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF4D4D', fontSize: 10 }}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Habits & Goals */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Today's Habits */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#f1f5f9' }}>Today's Habits</h3>
              <span className="badge badge-primary">{summary?.habits_completed || 0}/{summary?.habits_total || 0}</span>
            </div>
            <div style={{ display: 'grid', gap: 12, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
              {todayHabits?.slice(0, 6).map((item: any) => (
                <div
                  key={item.habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: item.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 18 }}>{item.habit.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.habit.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Streak: {item.habit.streak}d</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHabit(item.habit.id, item.completed)}
                    style={{
                      background: item.completed ? '#10b981' : 'transparent',
                      border: `2px solid ${item.completed ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 10
                    }}
                  >
                    {item.completed && '✓'}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/habits')}
              style={{
                background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, cursor: 'pointer', width: '100%', justifyContent: 'center'
              }}
            >
              Manage all habits <ChevronRight size={14} />
            </button>
          </div>

          {/* Today's Goals */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#f1f5f9' }}>Today's Goals</h3>
              <Target size={18} color="#06b6d4" />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {summary?.daily_goals?.length > 0 ? (
                summary.daily_goals.map((g: any) => (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      color: '#e2e8f0',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4' }} />
                    <span style={{ flex: 1 }}>{g.title}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13 }}>
                  No active goals today. Create some!
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/goals')}
              style={{
                background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, cursor: 'pointer', width: '100%', justifyContent: 'center'
              }}
            >
              Go to Goals <ChevronRight size={14} />
            </button>
          </div>

          {/* Infinity Performance Scores */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', color: '#f1f5f9', marginBottom: 20 }}>
              BHANOVA Indices
            </h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { label: 'Discipline Score', val: summary?.discipline_score || 0, color: '#3b82f6' },
                { label: 'Focus Score', val: summary?.focus_score || 0, color: '#818cf8' },
                { label: 'Health Score', val: summary?.health_score || 0, color: '#10b981' },
                { label: 'Learning Score', val: summary?.learning_score || 0, color: '#a78bfa' },
                { label: 'Energy Level', val: summary?.energy_level || 0, color: '#fbbf24' },
                { label: 'Recovery Score', val: summary?.recovery_score || 0, color: '#f43f5e' },
                { label: 'Placement Readiness', val: summary?.placement_readiness || 0, color: '#06b6d4' },
                { label: 'Master\'s Readiness', val: summary?.masters_readiness || 0, color: '#ec4899' },
              ].map((score, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{score.label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{score.val}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${score.val}%`, height: '100%', background: score.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
