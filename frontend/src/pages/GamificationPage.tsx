import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Shield, Zap, Flame, Award, Sparkles, ShoppingBag, CheckCircle, Lock } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function GamificationPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const fetchStatus = () => {
    api.get('/gamification/status')
      .then(res => {
        setStatus(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleBuyShield = async () => {
    setBuying(true)
    try {
      const res = await api.post('/gamification/buy-shield')
      toast.success(res.data.message || 'Streak Shield purchased!')
      setStatus((s: any) => ({
        ...s,
        streak_shields: res.data.streak_shields,
        xp: res.data.xp,
        level: res.data.level
      }))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to purchase shield')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div className="skeleton" style={{ height: 40, width: 250, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        </div>
      </div>
    )
  }

  const dailyQuest = status?.quests?.daily || { title: 'Habit Disciple', progress: 0, target: 3, completed: false, xp_reward: 50 }
  const weeklyQuest = status?.quests?.weekly || { title: 'Deep Focus Sprint', progress: 0, target: 8, completed: false, xp_reward: 150 }
  const monthlyQuest = status?.quests?.monthly || { title: 'DSA Mastermind', progress: 0, target: 10, completed: false, xp_reward: 300 }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Floating Confetti Particles Simulator */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: window.innerWidth / 2, y: window.innerHeight / 2, scale: Math.random() * 0.8 + 0.4 }}
                animate={{
                  x: window.innerWidth / 2 + (Math.random() - 0.5) * 600,
                  y: window.innerHeight / 2 + (Math.random() - 0.5) * 600 - 150,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                  background: ['#3b82f6', '#FF8A00', '#FF4D4D', '#22C55E', '#8B5CF6', '#FFD700'][i % 6]
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            🏆 Gamification Center <span className="gradient-text">Level {status?.level || 1}</span>
          </h1>
          <p style={{ color: '#7a7a7a', fontSize: 14, marginTop: 4 }}>
            Complete quests, earn badges, and buy shield items to protect your daily streaks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge" style={{ background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Zap size={14} /> {status?.xp || 0} XP
          </span>
          <span className="badge" style={{ background: 'rgba(79, 124, 255, 0.15)', color: '#4F7CFF', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Shield size={14} /> {status?.streak_shields || 0} Shields
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Progress & Shield shop */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Trophy size={18} color="#FFD700" /> Experience Level Status
            </h3>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#D1D5DB' }}>
                <span>Level {status?.level || 1} Sage</span>
                <span>{status?.xp || 0} / {(status?.level || 1) * 100} XP</span>
              </div>
              <div style={{ height: 8, background: '#050505', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((status?.xp || 0) / ((status?.level || 1) * 100)) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #4F7CFF, #8B5CF6)', borderRadius: 4 }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <ShoppingBag size={15} color="#4F7CFF" /> Shields Merchant
            </h4>
            <p style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 12 }}>
              A Streak Shield blocks habit streak loss if you miss check-ins. Cost: 80 XP.
            </p>
            <button
              onClick={handleBuyShield}
              className="btn-primary"
              disabled={buying || (status?.xp || 0) < 80}
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #4F7CFF, #8B5CF6)' }}
            >
              {buying ? 'Purchasing...' : 'Buy Streak Shield (-80 XP)'}
            </button>
          </div>
        </motion.div>

        {/* Quests / Missions */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: 24 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={18} color="#FF8A00" /> Active Missions
          </h3>
          
          <div style={{ display: 'grid', gap: 14 }}>
            {/* Daily Mission */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FF8A00', fontWeight: 700 }}>Daily Quest</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 2 }}>{dailyQuest.title}</div>
                  <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>{dailyQuest.description}</div>
                </div>
                <span className="badge" style={{ background: 'rgba(225, 225, 225, 0.05)', color: '#D1D5DB', fontSize: 10 }}>+{dailyQuest.xp_reward} XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ flex: 1, height: 5, background: '#050505', borderRadius: 2.5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (dailyQuest.progress / dailyQuest.target) * 100)}%`, height: '100%', background: '#FF8A00' }} />
                </div>
                <span style={{ fontSize: 11, color: '#7a7a7a' }}>{dailyQuest.progress}/{dailyQuest.target}</span>
              </div>
            </div>

            {/* Weekly Mission */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: '#4F7CFF', fontWeight: 700 }}>Weekly Quest</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 2 }}>{weeklyQuest.title}</div>
                  <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>{weeklyQuest.description}</div>
                </div>
                <span className="badge" style={{ background: 'rgba(225, 225, 225, 0.05)', color: '#D1D5DB', fontSize: 10 }}>+{weeklyQuest.xp_reward} XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ flex: 1, height: 5, background: '#050505', borderRadius: 2.5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (weeklyQuest.progress / weeklyQuest.target) * 100)}%`, height: '100%', background: '#4F7CFF' }} />
                </div>
                <span style={{ fontSize: 11, color: '#7a7a7a' }}>{weeklyQuest.progress}/{weeklyQuest.target}</span>
              </div>
            </div>

            {/* Monthly Challenge */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: '#8B5CF6', fontWeight: 700 }}>Monthly Challenge</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 2 }}>{monthlyQuest.title}</div>
                  <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>{monthlyQuest.description}</div>
                </div>
                <span className="badge" style={{ background: 'rgba(225, 225, 225, 0.05)', color: '#D1D5DB', fontSize: 10 }}>+{monthlyQuest.xp_reward} XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ flex: 1, height: 5, background: '#050505', borderRadius: 2.5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (monthlyQuest.progress / monthlyQuest.target) * 100)}%`, height: '100%', background: '#8B5CF6' }} />
                </div>
                <span style={{ fontSize: 11, color: '#7a7a7a' }}>{monthlyQuest.progress}/{monthlyQuest.target}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges Cabinet */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ padding: 24 }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Award size={18} color="#FFD700" /> Locked & Unlocked Badges Cabinet
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { id: 'builder', name: 'Habit Builder', icon: '🧱', desc: 'Created 5+ core habits', isUnlocked: (status?.badges?.some((b: any) => b.name === 'Habit Builder')) },
            { id: 'sage5', name: 'Level 5 Sage', icon: '🧙', desc: 'Earned Sage tier status', isUnlocked: (status?.badges?.some((b: any) => b.name === 'Level 5 Sage')) },
            { id: 'warrior', name: 'Algo Warrior', icon: '⚔️', desc: 'Solved 15+ DSA problems', isUnlocked: (status?.badges?.some((b: any) => b.name === 'Algo Warrior')) },
            { id: 'consist', name: 'Consistency Fire', icon: '🔥', desc: 'Maintained 7d streak', isUnlocked: (status?.current_streak >= 7) },
            { id: 'sleeper', name: 'Deep Sleeper', icon: '💤', desc: 'Averaged 7.5h sleep', isUnlocked: (status?.sleep_hours >= 7.5) },
            { id: 'fitwiz', name: 'Gym Gladiator', icon: '🏋️', desc: 'Logged 5+ compound logs', isUnlocked: true }
          ].map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{
                background: badge.isUnlocked ? 'rgba(255, 215, 0, 0.04)' : 'rgba(255,255,255,0.01)',
                border: badge.isUnlocked ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: '20px 16px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                opacity: badge.isUnlocked ? 1 : 0.6
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 4 }}>{badge.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: badge.isUnlocked ? '#FFFFFF' : '#7a7a7a' }}>{badge.name}</div>
              <div style={{ fontSize: 10, color: '#7a7a7a', lineHeight: 1.3 }}>{badge.desc}</div>
              
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: badge.isUnlocked ? '#FFD700' : '#7a7a7a'
              }}>
                {badge.isUnlocked ? <CheckCircle size={14} /> : <Lock size={14} />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
