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
      transition: { staggerChildren: 0.04 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 150, damping: 18 }
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
    return JSON.parse(localStorage.getItem('atlas_one_saved_quotes') || '[]')
  })
  const [showHistory, setShowHistory] = useState(false)

  const handleToggleFavoriteQuote = (quoteText: string) => {
    let updated: string[]
    if (savedQuotes.includes(quoteText)) {
      updated = savedQuotes.filter(q => q !== quoteText)
      toast.success('Removed from favorites', { id: 'fav-quote' })
    } else {
      updated = [...savedQuotes, quoteText]
      toast.success('Added to favorites', { id: 'fav-quote' })
    }
    setSavedQuotes(updated)
    localStorage.setItem('atlas_one_saved_quotes', JSON.stringify(updated))
  }

  const [greeting, setGreeting] = useState('Welcome')
  const [coachData, setCoachData] = useState<any>(null)
  const [coachLoading, setCoachLoading] = useState(true)

  useEffect(() => {
    api.get('/api/coach/insights')
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
          toast.success('Habit status updated', { id: 'habit-status' })
        }
      }
    )
  }

  if (summaryLoading || habitsLoading) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 280, height: 40 }} />
          <div className="skeleton" style={{ width: 140, height: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Premium Spacious Header Row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 24, marginBottom: 32
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>
            {greeting}, <span style={{ color: '#a1a1aa' }}>{summary?.user?.name || 'Bhanu'}</span>
          </h1>
          <p style={{ color: '#71717a', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} /> {formatToday()} • Keep up the momentum
          </p>
        </div>

        {/* Minimal Action Triggers */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => navigate('/planner')}>
            <Plus size={14} /> Planner
          </button>
          <button className="btn-primary" onClick={() => navigate('/diet')}>
            <Plus size={14} /> Log Diet
          </button>
        </div>
      </div>

      {/* Clean HUD Status Panel */}
      <div style={{
        backgroundColor: '#121214',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20 }}>🧠</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
              Level {summary?.user?.level || 1} Sage
            </div>
            <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>
              XP: {summary?.user?.xp || 0} / {(summary?.user?.level || 1) * 100}
            </div>
          </div>
        </div>

        {/* Clean XP indicator line */}
        <div style={{ flex: 1, maxWidth: 300, height: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden', margin: '0 8px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (((summary?.user?.xp || 0) / ((summary?.user?.level || 1) * 100)) * 100))}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: '100%', backgroundColor: '#ffffff', borderRadius: 2 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-warning" style={{ fontSize: 11 }}>
            🛡️ Shields: {summary?.user?.streak_shields || 0}
          </span>
          <span className="badge badge-success" style={{ fontSize: 11 }}>
            📈 Life Score: {summary?.life_score || 0}%
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}
      >
        {/* Study Hours KPI */}
        <motion.div className="metric-card" variants={itemVariants} onClick={() => navigate('/study')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Study Hours</span>
            <BookOpen size={16} color="#71717a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{summary?.today_study_hours || 0} hrs</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>Weekly total: {summary?.week_study_hours || 0} hrs</div>
        </motion.div>

        {/* Calories KPI */}
        <motion.div className="metric-card" variants={itemVariants} onClick={() => navigate('/diet')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calories Logged</span>
            <Flame size={16} color="#71717a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{summary?.today_calories || 0} kcal</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>Target limit: 2,000 kcal</div>
        </motion.div>

        {/* Weight KPI */}
        <motion.div className="metric-card" variants={itemVariants} onClick={() => navigate('/fitness')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Weight</span>
            <Scale size={16} color="#71717a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{summary?.latest_weight ? `${summary.latest_weight} kg` : 'No weight log'}</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>Fitness goal: Lean Bulk</div>
        </motion.div>

        {/* Sleep KPI */}
        <motion.div className="metric-card" variants={itemVariants} onClick={() => navigate('/sleep')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sleep Quality</span>
            <Moon size={16} color="#71717a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{summary?.sleep_hours ? `${summary.sleep_hours} hrs` : 'No sleep log'}</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>
            Quality: {summary?.sleep_quality ? '★'.repeat(summary.sleep_quality) + '☆'.repeat(5 - summary.sleep_quality) : 'Not Logged'}
          </div>
        </motion.div>

        {/* Streaks KPI */}
        <motion.div className="metric-card" variants={itemVariants} onClick={() => navigate('/habits')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Streak</span>
            <Trophy size={16} color="#71717a" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{summary?.current_streak || 0} Days</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>Habits consistency: {summary?.habit_consistency_percent || 0}%</div>
        </motion.div>
      </motion.div>

      {/* Spacious Double Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: 28, alignItems: 'start' }}>
        
        {/* Left Hand: AI insights & charts */}
        <div style={{ display: 'grid', gap: 28 }}>
          
          {/* AI Insights Card */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BrainCircuit size={18} color="#a1a1aa" />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
                AI Coach Insights
              </h3>
            </div>
            
            {coachLoading ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '90%' }} />
                <div className="skeleton" style={{ height: 14, width: '85%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Insights List */}
                {coachData?.insights?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {coachData.insights.map((ins: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#a1a1aa' }}>
                        <TrendingUp size={14} color="#71717a" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {coachData?.recommendations?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      Recommendations
                    </h4>
                    {coachData.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>
                        <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths */}
                {coachData?.strengths?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      Strengths
                    </h4>
                    {coachData.strengths.map((str: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>
                        <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weekly Study hours Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>Weekly Study Hours</h3>
              <span style={{ color: '#71717a', fontSize: 12, fontWeight: 500 }}>Tracked Sessions</span>
            </div>
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.weekly_study_data || []} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#27272a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#27272a" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#ffffff' }} />
                  <Area type="monotone" dataKey="hours" stroke="#ffffff" strokeWidth={1.5} fillOpacity={1} fill="url(#studyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Notion-style Quote Container */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Reflection • {dailyQuoteObj.category}
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => handleToggleFavoriteQuote(dailyQuoteObj.text)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: savedQuotes.includes(dailyQuoteObj.text) ? '#fbbf24' : '#52525b', fontSize: 14 }}
                >
                  ★
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', fontSize: 11 }}
                >
                  {showHistory ? 'Hide Favorites' : 'Favorites'}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#e4e4e7', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{dailyQuoteObj.text}"
            </p>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}
                >
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>Saved Quotes</h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {savedQuotes.length === 0 ? (
                      <div style={{ fontSize: 11, color: '#52525b' }}>No favorite quotes saved yet. Click the star icon to save!</div>
                    ) : (
                      savedQuotes.map((q, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>"{q}"</span>
                          <button
                            onClick={() => handleToggleFavoriteQuote(q)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10 }}
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

        {/* Right Hand: habits check-in & scores */}
        <div style={{ display: 'grid', gap: 28 }}>
          {/* Today's Habits */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>Today's Habits</h3>
              <span className="badge badge-primary">{summary?.habits_completed || 0}/{summary?.habits_total || 0}</span>
            </div>
            
            <div style={{ display: 'grid', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
              {todayHabits && todayHabits.length > 0 ? (
                todayHabits.slice(0, 6).map((item: any) => (
                  <div
                    key={item.habit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: item.completed ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15 }}>{item.habit.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: item.completed ? '#71717a' : '#ffffff', textDecoration: item.completed ? 'line-through' : 'none' }}>
                          {item.habit.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#71717a' }}>Streak: {item.habit.streak}d</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleHabit(item.habit.id, item.completed)}
                      className={`habit-checkbox ${item.completed ? 'completed' : ''}`}
                    >
                      {item.completed && '✓'}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#52525b', fontSize: 12 }}>
                  No habits defined for today.
                </div>
              )}
            </div>
            
            <button
              onClick={() => navigate('/habits')}
              style={{
                background: 'none', border: 'none', color: '#a1a1aa', fontWeight: 600, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, cursor: 'pointer', width: '100%', justifyContent: 'center'
              }}
              className="hover:text-white transition-colors"
            >
              Manage all habits <ChevronRight size={14} />
            </button>
          </div>

          {/* Today's Goals */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>Today's Goals</h3>
              <Target size={16} color="#71717a" />
            </div>
            
            <div style={{ display: 'grid', gap: 8 }}>
              {summary?.daily_goals?.length > 0 ? (
                summary.daily_goals.map((g: any) => (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: '#a1a1aa',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ffffff' }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#52525b', fontSize: 12 }}>
                  No active goals today.
                </div>
              )}
            </div>
            
            <button
              onClick={() => navigate('/goals')}
              style={{
                background: 'none', border: 'none', color: '#a1a1aa', fontWeight: 600, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, cursor: 'pointer', width: '100%', justifyContent: 'center'
              }}
              className="hover:text-white transition-colors"
            >
              Go to Goals <ChevronRight size={14} />
            </button>
          </div>

          {/* Minimal Atlas One Indices */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em', marginBottom: 20 }}>
              Atlas One Indices
            </h3>
            
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { label: 'Discipline Score', val: summary?.discipline_score || 0 },
                { label: 'Focus Score', val: summary?.focus_score || 0 },
                { label: 'Health Score', val: summary?.health_score || 0 },
                { label: 'Learning Score', val: summary?.learning_score || 0 },
                { label: 'Energy Level', val: summary?.energy_level || 0 },
                { label: 'Recovery Score', val: summary?.recovery_score || 0 },
                { label: 'Placement Readiness', val: summary?.placement_readiness || 0 },
                { label: 'Master\'s Readiness', val: summary?.masters_readiness || 0 },
              ].map((score, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#71717a' }}>{score.label}</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{score.val}%</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ width: `${score.val}%` }} className="progress-fill" />
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
