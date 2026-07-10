import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, AlertTriangle, MessageSquareHeart, ShieldAlert,
  Percent, Calendar, Award, RefreshCw, BarChart2, Activity, HelpCircle,
  Sliders, Gauge, Dumbbell, GitBranch, Zap, Check, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, Cell
} from 'recharts'
import {
  useMLPredictions, useMLForecast, useMLSentiment,
  useMLAnomalies, useMLInsights, useMLScores,
  useMLExplain, useMLConfidence, useMLEvaluate,
  useMLFeatureImportance, useMLRecommendations,
  useMLSimulation, useMLModelVersions, useMLSwitchVersion,
  useMLRisk, useMLRetrain
} from '@/hooks/useApi'

export default function MLDashboardPage() {
  const [activeTab, setActiveTab] = useState<'predictions' | 'coach' | 'simulation' | 'lab'>('predictions')
  const [xaiType, setXaiType] = useState<string>('productivity')

  // Load ML data endpoints
  const { data: predictions, isLoading: predLoading, refetch: refetchPreds } = useMLPredictions()
  const { data: forecast, isLoading: forecastLoading, refetch: refetchForecast } = useMLForecast()
  const { data: sentiment, isLoading: sentimentLoading, refetch: refetchSentiment } = useMLSentiment()
  const { data: anomalies, isLoading: anomaliesLoading, refetch: refetchAnomalies } = useMLAnomalies()
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useMLInsights()
  const { data: scores, isLoading: scoresLoading, refetch: refetchScores } = useMLScores()

  // Load new extended endpoints
  const { data: xaiData, isLoading: xaiLoading, refetch: refetchXai } = useMLExplain(xaiType)
  const { data: confidenceData, isLoading: confLoading, refetch: refetchConf } = useMLConfidence()
  const { data: evaluationData, isLoading: evalLoading, refetch: refetchEval } = useMLEvaluate()
  const { data: importanceData, isLoading: impLoading, refetch: refetchImp } = useMLFeatureImportance()
  const { data: recommendationsData, isLoading: recsLoading, refetch: refetchRecs } = useMLRecommendations()
  const { data: versionsData, isLoading: versionsLoading, refetch: refetchVersions } = useMLModelVersions()
  const { data: riskData, isLoading: riskLoading, refetch: refetchRisk } = useMLRisk()

  const switchVersionMutation = useMLSwitchVersion()
  const retrainMutation = useMLRetrain()
  const simulationMutation = useMLSimulation()

  // What-if simulator input states
  const [simInputs, setSimInputs] = useState({
    study_hours: 3.5,
    sleep_hours: 7.2,
    sleep_quality: 3.5,
    workout_duration: 45,
    water_ml: 1800,
    calories: 2200,
    journal_mood: 3.5,
    habit_completion_ratio: 0.75
  })

  const [simResults, setSimResults] = useState<any>(null)

  // Run initial simulation
  useEffect(() => {
    if (simulationMutation.isIdle) {
      simulationMutation.mutate(simInputs, {
        onSuccess: (data) => setSimResults(data)
      })
    }
  }, [])

  const handleSimInputChange = (key: string, val: number) => {
    const updated = { ...simInputs, [key]: val }
    setSimInputs(updated)
    simulationMutation.mutate(updated, {
      onSuccess: (data) => setSimResults(data)
    })
  }

  const handleRefreshAll = () => {
    refetchPreds()
    refetchForecast()
    refetchSentiment()
    refetchAnomalies()
    refetchInsights()
    refetchScores()
    refetchXai()
    refetchConf()
    refetchEval()
    refetchImp()
    refetchRecs()
    refetchVersions()
    refetchRisk()
  }

  const handleRetrain = () => {
    retrainMutation.mutate(undefined, {
      onSuccess: () => {
        handleRefreshAll()
      }
    })
  }

  const handleSwitchVersion = (tag: string) => {
    switchVersionMutation.mutate({ version_tag: tag }, {
      onSuccess: () => {
        handleRefreshAll()
      }
    })
  }

  const isLoading = predLoading || forecastLoading || sentimentLoading || anomaliesLoading ||
                    insightsLoading || scoresLoading || xaiLoading || confLoading ||
                    evalLoading || impLoading || recsLoading || versionsLoading || riskLoading

  const tabs = [
    { id: 'predictions', label: 'Predictions & Risk', icon: Brain },
    { id: 'coach', label: 'AI Coach & Optimizer', icon: Sparkles },
    { id: 'simulation', label: 'What-If Simulation', icon: Sliders },
    { id: 'lab', label: 'Model Lab & Versions', icon: GitBranch }
  ] as const

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.75) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.12)' }
    if (prob >= 0.45) return { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.12)' }
    return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.12)' }
  }

  const getRiskColor = (label: string) => {
    if (label === 'High') return '#ef4444'
    if (label === 'Medium') return '#fbbf24'
    return '#10b981'
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Premium Header Row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 24, marginBottom: 32
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={32} style={{ color: '#06b6d4' }} /> AI Analytics & Predictive Models
          </h1>
          <p style={{ color: '#71717a', fontSize: 13, marginTop: 6 }}>
            Explore productivity regressions, What-If projection simulation, personalized goal optimization, and active model version management.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={isLoading}
          className="btn-secondary"
          style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Loading Engine...' : 'Sync AI Engine'}
        </button>
      </div>

      {/* Notion-style tab bar */}
      <div className="tab-bar" style={{ display: 'inline-flex', marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px', width: '100%' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #06b6d4' : '2px solid transparent',
                color: active ? '#ffffff' : '#71717a',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Loading experience skeletons */}
      {isLoading && !predictions ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {/* ──────────────── TAB 1: PREDICTIONS & RISK ──────────────── */}
            {activeTab === 'predictions' && predictions && scores && confidenceData && riskData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                
                {/* Confidence & Prediction Probability Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                  
                  {/* Productivity Card with Confidence Intervals */}
                  <div className="glass-card" style={{ padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', minHeight: 280 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Productivity Regressor
                        </span>
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Percent size={11} /> {confidenceData.productivity.confidence}% confidence
                        </span>
                      </div>
                      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginTop: 8, marginBottom: 4 }}>Productivity Output</h2>
                      <p style={{ color: '#71717a', fontSize: 12 }}>Continuous scale prediction intervals & regression output</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '20px 0' }}>
                      <span style={{ fontSize: 48, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                        {confidenceData.productivity.score}%
                      </span>
                      <span style={{ color: '#71717a', fontSize: 13 }}>
                        Interval: {confidenceData.productivity.interval[0]}% - {confidenceData.productivity.interval[1]}%
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                        <span>Probability index:</span>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{confidenceData.productivity.probability}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ width: `${confidenceData.productivity.probability * 100}%`, height: '100%', background: '#06b6d4', borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>

                  {/* Career Readiness Model */}
                  <div className="glass-card" style={{ padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', minHeight: 280 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Placement Predictor
                        </span>
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Percent size={11} /> {confidenceData.placement.confidence}% confidence
                        </span>
                      </div>
                      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginTop: 8, marginBottom: 4 }}>Placement Readiness</h2>
                      <p style={{ color: '#71717a', fontSize: 12 }}>Cumulative DSA, mock interview confidence, and projects index</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '20px 0' }}>
                      <span style={{ fontSize: 48, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                        {confidenceData.placement.score}%
                      </span>
                      <span style={{ color: '#71717a', fontSize: 13 }}>
                        Interval: {confidenceData.placement.interval[0]}% - {confidenceData.placement.interval[1]}%
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                        <span>Probability index:</span>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{confidenceData.placement.probability}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ width: `${confidenceData.placement.probability * 100}%`, height: '100%', background: '#10b981', borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>

                  {/* Burnout Risk Model */}
                  <div className="glass-card" style={{ padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between', minHeight: 280 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Burnout Classifier
                        </span>
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Percent size={11} /> {confidenceData.burnout.confidence}% confidence
                        </span>
                      </div>
                      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginTop: 8, marginBottom: 4 }}>Burnout Risk Index</h2>
                      <p style={{ color: '#71717a', fontSize: 12 }}>Wellness logs, sleep deprivation and study workload ratio</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '20px 0' }}>
                      <span style={{ fontSize: 48, fontWeight: 800, color: getRiskColor(riskData.burnout.label), lineHeight: 1 }}>
                        {confidenceData.burnout.score}%
                      </span>
                      <span style={{ color: '#71717a', fontSize: 13 }}>
                        Severity: {riskData.burnout.label}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                        <span>Probability index:</span>
                        <span style={{ fontWeight: 600, color: getRiskColor(riskData.burnout.label) }}>{confidenceData.burnout.probability}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ width: `${confidenceData.burnout.probability * 100}%`, height: '100%', background: getRiskColor(riskData.burnout.label), borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainable AI (XAI) Factors Row */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Gauge size={16} /> Explainable AI (XAI) Factor Analysis
                      </h2>
                      <p style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}>
                        Understand WHY predictions were generated based on actual mathematical feature coefficients.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {['productivity', 'placement', 'burnout'].map(type => (
                        <button
                          key={type}
                          onClick={() => setXaiType(type)}
                          style={{
                            padding: '6px 12px',
                            background: xaiType === type ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                            color: xaiType === type ? '#ffffff' : '#a1a1aa',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {xaiData && xaiData.factors ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {xaiData.factors.map((f: any, idx: number) => {
                        const isPos = f.type === 'positive'
                        return (
                          <div key={idx} style={{
                            background: 'rgba(255,255,255,0.01)',
                            border: `1px solid ${isPos ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'}`,
                            padding: '16px',
                            borderRadius: 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Feature Contribution</span>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', margin: '4px 0 0 0' }}>{f.factor}</h4>
                            </div>
                            <span style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: isPos ? '#10b981' : '#ef4444',
                              background: isPos ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                              padding: '4px 8px',
                              borderRadius: 6
                            }}>
                              {isPos ? '+' : ''}{Math.round(f.contribution)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24, color: '#71717a' }}>No explanations loaded.</div>
                  )}
                </div>

                {/* Risk Analysis meter */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                  
                  {/* Risk Meter Panel */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldAlert size={16} /> Behavior Risk Analysis
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Outlines potential behavioral or goal completion bottlenecks</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {Object.keys(riskData).map((key) => {
                        const risk = riskData[key]
                        const color = getRiskColor(risk.label)
                        return (
                          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                              <span style={{ textTransform: 'capitalize', color: '#e4e4e7', fontWeight: 500 }}>{key.replace('_', ' ')}</span>
                              <span style={{ color: color, fontWeight: 600 }}>{risk.label} ({risk.score}%)</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.03)', borderRadius: 2.5 }}>
                              <div style={{ width: `${risk.score}%`, height: '100%', background: color, borderRadius: 2.5 }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Anomaly Alerts Feed (Preserved) */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} color="#ef4444" /> Outlier Anomaly Detection
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Days flagged as anomalous by the Isolation Forest model.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                      {anomalies.anomalies && anomalies.anomalies.length > 0 ? (
                        anomalies.anomalies.map((anom: any, idx: number) => {
                          const isHigh = anom.severity === 'high'
                          const isMed = anom.severity === 'medium'
                          return (
                            <div key={idx} style={{
                              background: 'rgba(255, 255, 255, 0.01)',
                              border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.12)' : isMed ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255,255,255,0.03)'}`,
                              padding: '10px 14px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={12} color="#71717a" /> {new Date(anom.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <span className={`badge ${isHigh ? 'badge-danger' : isMed ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: 9 }}>
                                  {anom.severity}
                                </span>
                              </div>
                              <ul style={{ paddingLeft: '14px', margin: 0, fontSize: 11, color: '#a1a1aa' }}>
                                {anom.alerts.map((alert: string, aIdx: number) => (
                                  <li key={aIdx}>{alert}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: '#52525b', fontSize: 12 }}>
                          No anomaly events flagged. Routine metrics are within standard deviation.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── TAB 2: AI COACH & OPTIMIZER ──────────────── */}
            {activeTab === 'coach' && recommendationsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                
                {/* Recommendations Grid */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquareHeart size={16} /> Data-Supported Weekly Coach Insights
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {recommendationsData.recommendations.map((r: any, idx: number) => (
                      <div key={idx} style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        padding: 20,
                        borderRadius: 12,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start'
                      }}>
                        <div style={{
                          background: 'rgba(6, 182, 212, 0.08)',
                          color: '#06b6d4',
                          padding: 8,
                          borderRadius: 8,
                          flexShrink: 0
                        }}>
                          <Brain size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>{r.category} AI recommendation</span>
                          <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, margin: '4px 0 8px 0', lineHeight: 1.5 }}>
                            {r.text}
                          </p>
                          <span style={{ color: '#71717a', fontSize: 11 }}>{r.supporting_data}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal Optimizer & Projections */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                  
                  {/* Goal Optimizer */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={16} /> AI Goal Optimizer
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Recommended daily target balances to maximize productivity</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Daily Study Block</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_daily_study_hours} hrs
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Optimal Sleep</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_sleep_duration} hrs
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Workout Target</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_workout_schedule}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Daily Protein Goal</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_protein_intake_g} g
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Revision Spacing</span>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_revision_schedule}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Coding Frequency</span>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                          {recommendationsData.optimizer.best_coding_frequency}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Timeline Simulation */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={16} /> Timeline Projections
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Simulate future physical & professional progress milestones</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['30', '90', '180', '365'].map(days => {
                        const proj = recommendationsData.timeline[days]
                        return (
                          <div key={days} style={{
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            padding: '12px 16px',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4' }}>{days} Days</span>
                              <ChevronRight size={13} style={{ color: '#27272a' }} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 11, color: '#a1a1aa' }}>Weight: {proj.weight}kg ({proj.body_fat}% fat)</span>
                                <span style={{ fontSize: 11, color: '#a1a1aa' }}>DSA Problems: {proj.dsa_solved} solved</span>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                                Readiness: {proj.placement_readiness}%
                              </div>
                              <span style={{ fontSize: 9, color: '#71717a' }}>Health Index: {proj.health_score}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── TAB 3: WHAT-IF SIMULATION ──────────────── */}
            {activeTab === 'simulation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                  
                  {/* Parameter Sliders Card */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sliders size={16} /> Simulated Scenarios
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Adjust daily values to simulate prediction models output</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      
                      {/* Study Hours slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Daily Study Hours</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{simInputs.study_hours} hrs</span>
                        </div>
                        <input
                          type="range" min="0" max="14" step="0.5"
                          value={simInputs.study_hours}
                          onChange={(e) => handleSimInputChange('study_hours', parseFloat(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                      {/* Sleep Hours slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Daily Sleep Hours</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{simInputs.sleep_hours} hrs</span>
                        </div>
                        <input
                          type="range" min="3" max="11" step="0.1"
                          value={simInputs.sleep_hours}
                          onChange={(e) => handleSimInputChange('sleep_hours', parseFloat(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                      {/* Sleep Quality slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Sleep Quality Rating</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{simInputs.sleep_quality} / 5</span>
                        </div>
                        <input
                          type="range" min="1" max="5" step="0.5"
                          value={simInputs.sleep_quality}
                          onChange={(e) => handleSimInputChange('sleep_quality', parseFloat(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                      {/* Workout Duration slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Workout Duration</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{simInputs.workout_duration} mins</span>
                        </div>
                        <input
                          type="range" min="0" max="120" step="5"
                          value={simInputs.workout_duration}
                          onChange={(e) => handleSimInputChange('workout_duration', parseInt(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                      {/* Calorie Intake slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Calorie Intake</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{simInputs.calories} kcal</span>
                        </div>
                        <input
                          type="range" min="1200" max="4500" step="50"
                          value={simInputs.calories}
                          onChange={(e) => handleSimInputChange('calories', parseInt(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                      {/* Habit Completion slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#e4e4e7' }}>Habit Streak Ratio</span>
                          <span style={{ fontWeight: 600, color: '#06b6d4' }}>{Math.round(simInputs.habit_completion_ratio * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="1" step="0.05"
                          value={simInputs.habit_completion_ratio}
                          onChange={(e) => handleSimInputChange('habit_completion_ratio', parseFloat(e.target.value))}
                          style={{ accentColor: '#06b6d4', width: '100%' }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Simulator Outputs Card */}
                  <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} /> Instant Predicted Metrics
                      </h2>
                      <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Model predictions recalculate immediately as sliders shift</p>
                    </div>

                    {simulationMutation.isPending && !simResults ? (
                      <div className="skeleton" style={{ height: 200, width: '100%' }} />
                    ) : simResults ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          
                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Productivity Score</span>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                              {simResults.productivity_score}%
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Placement readiness</span>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                              {simResults.placement_readiness}%
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Burnout Risk</span>
                            <div style={{ fontSize: 24, fontWeight: 800, color: getRiskColor(simResults.burnout_risk >= 65 ? 'High' : simResults.burnout_risk >= 35 ? 'Medium' : 'Low'), marginTop: 2 }}>
                              {simResults.burnout_risk}%
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>DSA Problems Solved</span>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                              {simResults.dsa_progress}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Learning Score</span>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                              {simResults.learning_score}%
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>Goal Target Date</span>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', marginTop: 6 }}>
                              {new Date(simResults.goal_completion_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#a1a1aa', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Check size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
                          All simulation output runs are logged in your database history feed.
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#71717a', fontSize: 12 }}>Adjust parameters to simulate output.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── TAB 4: MODEL LAB & VERSIONS ──────────────── */}
            {activeTab === 'lab' && evaluationData && versionsData && importanceData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                
                {/* Version switcher & manual retrain row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                  
                  {/* Model version switcher */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GitBranch size={16} /> Model Version Selector
                        </h2>
                        <p style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}>Deploy and switch model versions dynamically</p>
                      </div>
                      
                      <button
                        onClick={handleRetrain}
                        disabled={retrainMutation.isPending}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        {retrainMutation.isPending ? 'Retraining...' : 'Trigger Retrain'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {versionsData.map((v: any) => (
                        <div key={v.version_tag} style={{
                          background: v.is_active ? 'rgba(6, 182, 212, 0.03)' : 'rgba(255,255,255,0.01)',
                          border: v.is_active ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.03)',
                          padding: 14,
                          borderRadius: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Model {v.version_tag}</h3>
                              {v.is_active && (
                                <span className="badge badge-success" style={{ fontSize: 9 }}>Active Prod</span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                              Trained: {new Date(v.training_date).toLocaleDateString()} | Dataset Size: {v.dataset_size} days
                            </p>
                          </div>

                          {!v.is_active && (
                            <button
                              onClick={() => handleSwitchVersion(v.version_tag)}
                              disabled={switchVersionMutation.isPending}
                              style={{
                                padding: '4px 10px',
                                background: 'rgba(255,255,255,0.03)',
                                color: '#e4e4e7',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Importance charts */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChart2 size={16} /> Global Feature Importances
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 12, marginBottom: 16 }}>Relative weights showing feature impact on target variables</p>
                    
                    <div style={{ height: 260, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={importanceData.slice(0, 6)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                          <XAxis type="number" stroke="#27272a" fontSize={9} tickLine={false} />
                          <YAxis dataKey="label" type="category" stroke="#71717a" fontSize={9} width={90} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#121214', border: '1px solid rgba(255,255,255,0.05)', color: '#ffffff' }} />
                          <Bar dataKey="importance_pct" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                            {importanceData.slice(0, 6).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.type === 'positive' ? '#06b6d4' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Model Evaluation Metrics cards */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} /> Validation & Model Evaluation Metrics
                  </h2>
                  <p style={{ color: '#71717a', fontSize: 12, marginBottom: 20 }}>Model performance metrics calculated during 80/20 dataset validation splits</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    
                    {/* Productivity Regressor metrics */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 18, borderRadius: 10 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>Productivity Regressor</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>MAE (Mean Absolute Error):</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>{evaluationData.metrics.regression.productivity.mae}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>RMSE (Root Mean Squared Error):</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>{evaluationData.metrics.regression.productivity.rmse}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>R² (Coefficient of Determination):</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{evaluationData.metrics.regression.productivity.r2}</span>
                        </div>
                      </div>
                    </div>

                    {/* Placement Regressor metrics */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 18, borderRadius: 10 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>Placement Regressor</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>MAE (Mean Absolute Error):</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>{evaluationData.metrics.regression.placement.mae}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>RMSE (Root Mean Squared Error):</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>{evaluationData.metrics.regression.placement.rmse}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>R² (Coefficient of Determination):</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{evaluationData.metrics.regression.placement.r2}</span>
                        </div>
                      </div>
                    </div>

                    {/* Burnout Classifier metrics */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 18, borderRadius: 10 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>Burnout Classifier</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>Accuracy Score:</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{evaluationData.metrics.classification.burnout.accuracy}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>Precision / Recall:</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>
                            {evaluationData.metrics.classification.burnout.precision} / {evaluationData.metrics.classification.burnout.recall}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#71717a' }}>F1 Score / ROC AUC:</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>
                            {evaluationData.metrics.classification.burnout.f1_score} / {evaluationData.metrics.classification.burnout.roc_auc}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
