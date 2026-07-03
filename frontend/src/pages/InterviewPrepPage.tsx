import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Star, CheckCircle, Award, Compass, AlertCircle } from 'lucide-react'
import { useInterviewTopics, useInterviewReadiness, useUpdateInterviewTopic } from '@/hooks/useApi'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import toast from 'react-hot-toast'

export default function InterviewPrepPage() {
  const { data: topics, isLoading: topicsLoading } = useInterviewTopics()
  const { data: readiness } = useInterviewReadiness()
  const updateTopic = useUpdateInterviewTopic()

  const handleConfidenceChange = (id: number, rating: number) => {
    updateTopic.mutate({
      id,
      data: { confidence_rating: rating }
    }, {
      onSuccess: () => {
        toast.success('Confidence updated!')
      }
    })
  }

  const handleProgressChange = (id: number, pct: number) => {
    updateTopic.mutate({
      id,
      data: { completion_percent: pct }
    })
  }

  // Prep data for Radar chart
  const radarData = topics?.map((t: any) => ({
    subject: t.name.substring(0, 12),
    A: t.completion_percent,
    fullMark: 100
  })) || []

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">🧠 Interview Preparation</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Prepare for Technical and Behavioral interviews, monitor core subjects confidence, and track mock test rates.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Summary Readiness Ring & Radar Chart */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Readiness gauge */}
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Overall Readiness</h3>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="56" fill="none"
                  stroke="#06b6d4" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (readiness?.overall_readiness || 0) / 100)}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{readiness?.overall_readiness || 0}%</span>
                <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Ready</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              Calculated based on completing modules & mock interviews. Aim for 85%+ readiness.
            </p>
          </div>

          {/* Radar Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Preparation Shape</h3>
            <div style={{ height: 220, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <Radar name="Completion %" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Topic Cards with interactive sliders and stars */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Prep Modules</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {topicsLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
              ))
            ) : (
              topics?.map((topic: any) => (
                <div
                  key={topic.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{topic.name}</h4>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Category: {topic.category}</span>
                    </div>

                    {/* Confidence Rating (Stars) */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleConfidenceChange(topic.id, star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={16}
                            fill={star <= topic.confidence_rating ? '#fbbf24' : 'none'}
                            color={star <= topic.confidence_rating ? '#fbbf24' : '#475569'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Completion Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                      <span>Completion Pct</span>
                      <span>{Math.round(topic.completion_percent)}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="range"
                        min="0" max="100"
                        value={topic.completion_percent}
                        onChange={(e) => handleProgressChange(topic.id, parseInt(e.target.value))}
                        style={{ flex: 1, accentColor: '#06b6d4', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
