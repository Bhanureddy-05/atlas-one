import React, { useState } from 'react'
import { useAnalytics } from '@/hooks/useApi'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { motion } from 'framer-motion'
import { BookOpen, Code2, Flame, Scale, Zap, Moon, Music, BookMarked, Brain } from 'lucide-react'

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data: analytics, isLoading } = useAnalytics(days)

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6']

  if (isLoading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 200, height: 40 }} />
          <div className="skeleton" style={{ width: 150, height: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header with filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title">📊 Analytics Center</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Compare historical statistics and visualize performance patterns.</p>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${days === 7 ? 'active' : ''}`} onClick={() => setDays(7)}>7 Days</button>
          <button className={`tab-btn ${days === 30 ? 'active' : ''}`} onClick={() => setDays(30)}>30 Days</button>
          <button className={`tab-btn ${days === 90 ? 'active' : ''}`} onClick={() => setDays(90)}>90 Days</button>
        </div>
      </div>

      {/* Analytics Chart Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24 }}>
        
        {/* 1. Study Hours */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <BookOpen size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Focused Study Hours</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.study_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. DSA Topics Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Code2 size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>DSA Solved Per Topic</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dsa_by_topic || []}>
                <XAxis dataKey="topic" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Calories Intake */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Flame size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Calories & Macronutrients</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.calorie_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Weight progression */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Scale size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Weight Progression</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.weight_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Habit consistency */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Zap size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Habit Completion consistency %</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.habit_consistency || []} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={90} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="percent" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Sleep patterns */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Moon size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Sleep Duration</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.sleep_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Singing minutes */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Music size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Singing practice minutes</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.singing_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="minutes" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Reading stats */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <BookMarked size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Reading progress pages</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.reading_data || []}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="pages" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. Study topics hours share donut */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' }}>
            <BookOpen size={18} color="#6366f1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Subject Hours Distribution</h3>
          </div>
          <div style={{ height: 240, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.study_by_topic || []}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="hours"
                >
                  {analytics?.study_by_topic?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
