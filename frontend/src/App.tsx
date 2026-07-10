import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useNotifications } from '@/hooks/useNotifications'
import Layout from '@/components/Layout'
import logo from '@/assets/logo.svg'

// ── Lazy Loaded Pages ──────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const HabitsPage = lazy(() => import('@/pages/HabitsPage'))
const StudyPage = lazy(() => import('@/pages/StudyPage'))
const DSAPage = lazy(() => import('@/pages/DSAPage'))
const InterviewPrepPage = lazy(() => import('@/pages/InterviewPrepPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const FitnessPage = lazy(() => import('@/pages/FitnessPage'))
const DietPage = lazy(() => import('@/pages/DietPage'))
const SleepPage = lazy(() => import('@/pages/SleepPage'))
const SingingPage = lazy(() => import('@/pages/SingingPage'))
const ReadingPage = lazy(() => import('@/pages/ReadingPage'))
const GoalsPage = lazy(() => import('@/pages/GoalsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const DailyPlannerPage = lazy(() => import('@/pages/DailyPlannerPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const JournalPage = lazy(() => import('@/pages/JournalPage'))
const FinancePage = lazy(() => import('@/pages/FinancePage'))
const MastersPage = lazy(() => import('@/pages/MastersPage'))
const PlacementPage = lazy(() => import('@/pages/PlacementPage'))
const KnowledgePage = lazy(() => import('@/pages/KnowledgePage'))
const VoicePage = lazy(() => import('@/pages/VoicePage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))
const SharingPage = lazy(() => import('@/pages/SharingPage'))
const GamificationPage = lazy(() => import('@/pages/GamificationPage'))
const AIChatPage = lazy(() => import('@/pages/AIChatPage'))
const MLDashboardPage = lazy(() => import('@/pages/MLDashboardPage'))

// Status Pages
import { Page404, Page403, Page500, PageOffline } from '@/pages/StatusPages'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', gap: 16, color: '#f1f5f9'
    }}>
      <div className="animate-spin" style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4'
      }} />
      <span style={{ fontSize: 14, color: '#a1a1aa', letterSpacing: '0.05em' }}>Initializing Atlas One...</span>
    </div>
  )
}

const isLocal = import.meta.env.DEV || 
                (typeof window !== 'undefined' && 
                 (window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.hostname === '[::1]'))

const BASE_URL = isLocal ? 'http://127.0.0.1:8000' : (import.meta.env.VITE_API_URL || '/api')
const HEALTH_URL = BASE_URL.endsWith('/') ? `${BASE_URL}health` : `${BASE_URL}/health`

export default function App() {
  useNotifications()
  
  const [healthStatus, setHealthStatus] = React.useState<'checking' | 'waking' | 'ready'>(
    isLocal ? 'ready' : 'checking'
  )
  const [dots, setDots] = React.useState('.')

  console.log('--- ATLAS ONE DEBUG ---')
  console.log('import.meta.env.DEV:', import.meta.env.DEV)
  console.log('import.meta.env.MODE:', import.meta.env.MODE)
  console.log('isLocal:', isLocal)
  console.log('healthStatus:', healthStatus)
  console.log('BASE_URL:', BASE_URL)
  console.log('HEALTH_URL:', HEALTH_URL)

  React.useEffect(() => {
    if (isLocal) return

    let interval: any
    let dotInterval: any
    
    dotInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 500)

    const checkHealth = async () => {
      try {
        const res = await fetch(HEALTH_URL)
        if (res.ok) {
          setHealthStatus('ready')
          clearInterval(interval)
          clearInterval(dotInterval)
        } else {
          setHealthStatus('waking')
        }
      } catch (err) {
        setHealthStatus('waking')
      }
    }

    checkHealth()
    // Poll every 3 seconds
    interval = setInterval(checkHealth, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(dotInterval)
    }
  }, [isLocal])

  if (healthStatus !== 'ready') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#09090b', padding: '24px', textAlign: 'center', color: '#f4f4f5',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          background: '#121214', padding: '48px 32px', borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.04)', maxWidth: '460px', width: '100%',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
        }}>
          <img
            src={logo}
            alt="Atlas One Logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            style={{
              width: 140,
              marginBottom: 24, display: 'block'
            }}
          />
          
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: 8, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Atlas One
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, lineHeight: 1.5, marginBottom: 24 }}>
            Personal Analytics & Predictive Insights
          </p>

          <div style={{
            position: 'relative', width: 48, height: 48, margin: '12px 0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="animate-spin" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTopColor: '#DC2626'
            }} />
          </div>
          
          <div style={{
            fontSize: '12px', color: '#71717a', background: 'rgba(220, 38, 38, 0.02)',
            padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.08)',
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>Connection Status:</span>
            <span style={{ 
              fontWeight: 700, 
              color: '#DC2626',
              letterSpacing: '0.05em'
            }}>
              CONNECTING{dots}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/403" element={<Page403 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="/offline" element={<PageOffline />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="planner" element={<DailyPlannerPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="dsa" element={<DSAPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="fitness" element={<FitnessPage />} />
          <Route path="diet" element={<DietPage />} />
          <Route path="sleep" element={<SleepPage />} />
          <Route path="singing" element={<SingingPage />} />
          <Route path="reading" element={<ReadingPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="masters" element={<MastersPage />} />
          <Route path="placement" element={<PlacementPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="voice" element={<VoicePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="sharing" element={<SharingPage />} />
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="ai-dashboard" element={<MLDashboardPage />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Suspense>
  )
}
