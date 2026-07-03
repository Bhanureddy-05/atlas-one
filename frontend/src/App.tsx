import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useNotifications } from '@/hooks/useNotifications'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import HabitsPage from '@/pages/HabitsPage'
import StudyPage from '@/pages/StudyPage'
import DSAPage from '@/pages/DSAPage'
import InterviewPrepPage from '@/pages/InterviewPrepPage'
import ProjectsPage from '@/pages/ProjectsPage'
import FitnessPage from '@/pages/FitnessPage'
import DietPage from '@/pages/DietPage'
import SleepPage from '@/pages/SleepPage'
import SingingPage from '@/pages/SingingPage'
import ReadingPage from '@/pages/ReadingPage'
import GoalsPage from '@/pages/GoalsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ReportsPage from '@/pages/ReportsPage'
import DailyPlannerPage from '@/pages/DailyPlannerPage'
import SettingsPage from '@/pages/SettingsPage'
import JournalPage from '@/pages/JournalPage'
import FinancePage from '@/pages/FinancePage'
import MastersPage from '@/pages/MastersPage'
import PlacementPage from '@/pages/PlacementPage'
import KnowledgePage from '@/pages/KnowledgePage'
import VoicePage from '@/pages/VoicePage'
import TimelinePage from '@/pages/TimelinePage'
import SharingPage from '@/pages/SharingPage'
import GamificationPage from '@/pages/GamificationPage'
import AIChatPage from '@/pages/AIChatPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  useNotifications()
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
