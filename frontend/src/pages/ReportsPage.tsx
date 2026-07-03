import React, { useState } from 'react'
import { useWeeklyReport, useMonthlyReport, useYearlyReport } from '@/hooks/useApi'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Lightbulb, TrendingUp, Trophy, FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')

  const weekly = useWeeklyReport()
  const monthly = useMonthlyReport()
  const yearly = useYearlyReport()

  const currentReportQuery = activeTab === 'weekly' ? weekly : activeTab === 'monthly' ? monthly : yearly
  const report = currentReportQuery.data

  const handleExport = () => {
    window.print()
    toast.success('Document printed successfully')
  }

  if (currentReportQuery.isLoading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 250, height: 40 }} />
          <div className="skeleton" style={{ width: 120, height: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">📄 Growth Reports</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Aggregated insights, achievement badges, strengths, weaknesses and recommendations.
          </p>
        </div>
        <button className="btn-primary" onClick={handleExport}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, display: 'inline-flex' }}>
        <button className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>Weekly Report</button>
        <button className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Monthly Report</button>
        <button className={`tab-btn ${activeTab === 'yearly' ? 'active' : ''}`} onClick={() => setActiveTab('yearly')}>Yearly Report</button>
      </div>

      {/* Period Frame */}
      <div style={{ fontSize: 13, color: '#94a3b8', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        📅 Period Range: <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{report?.period?.start}</span> to <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{report?.period?.end}</span>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Study Hours', value: `${report?.study_hours || 0} hrs`, color: '#6366f1' },
          { label: 'DSA Solved', value: `${report?.dsa_total_solved || 0} solved`, color: '#06b6d4' },
          { label: 'Habit Consistency', value: `${report?.habit_compliance_percent || 0}%`, color: '#10b981' },
          { label: 'Gym Days Logged', value: `${report?.gym_days || 0} days`, color: '#ef4444' },
          { label: 'Avg Calories', value: `${Math.round(report?.avg_daily_calories || 0)} kcal`, color: '#f59e0b' },
          { label: 'Avg Sleep', value: `${report?.avg_sleep_hours || 0} hrs`, color: '#8b5cf6' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ padding: 16, borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Strengths */}
        <div className="glass-card" style={{ padding: 24, borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, color: '#10b981' }}>
            <CheckCircle size={18} />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Strengths & Wins</h3>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {report?.strengths?.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#10b981' }}>✓</span> {s}
              </div>
            )) || <p style={{ fontSize: 12, color: '#64748b' }}>No strengths noted yet.</p>}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="glass-card" style={{ padding: 24, borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, color: '#ef4444' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Weaknesses & Drops</h3>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {report?.weaknesses?.map((w: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#ef4444' }}>✗</span> {w}
              </div>
            )) || <p style={{ fontSize: 12, color: '#64748b' }}>No warnings noted yet.</p>}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card" style={{ padding: 24, borderTop: '4px solid #06b6d4', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, color: '#06b6d4' }}>
          <Lightbulb size={18} />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recommendations</h3>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {report?.recommendations?.map((r: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, display: 'flex', gap: 8 }}>
              <span style={{ color: '#06b6d4' }}>★</span> {r}
            </div>
          )) || <p style={{ fontSize: 12, color: '#64748b' }}>No recommendations yet.</p>}
        </div>
      </div>

      {/* Achievement badges */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, color: '#f59e0b' }}>
          <Trophy size={18} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Milestone Badges</h3>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {report?.habit_compliance_percent >= 80 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 14px', borderRadius: 12, fontSize: 12, color: '#34d399', fontWeight: 600 }}>
              🏆 Consistency Master
            </div>
          )}
          {report?.study_hours >= 15 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '8px 14px', borderRadius: 12, fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
              🎓 Scholar Sprint
            </div>
          )}
          {report?.gym_days >= 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 14px', borderRadius: 12, fontSize: 12, color: '#f87171', fontWeight: 600 }}>
              🔥 Gym Gladiator
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
