import React from 'react'
import { AlertCircle, ShieldAlert, WifiOff, Settings, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface StatusPageProps {
  title: string
  subtitle: string
  icon: React.ComponentType<any>
  code?: string
}

export function StatusPage({ title, subtitle, icon: Icon, code }: StatusPageProps) {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#090d16', padding: '24px', textAlign: 'center', color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.02)', padding: '48px', borderRadius: '32px',
        border: '1px solid rgba(255,255,255,0.06)', maxWidth: '480px', width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {code && (
          <span style={{
            fontSize: '56px', fontWeight: 900, background: 'linear-gradient(135deg, #00b4d8, #9d4edd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px'
          }}>
            {code}
          </span>
        )}
        <div style={{
          background: 'rgba(6, 182, 212, 0.1)', padding: '16px', borderRadius: '20px',
          color: '#06b6d4', marginBottom: '24px'
        }}>
          <Icon size={40} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{title}</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>{subtitle}</p>
        
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #00b4d8, #9d4edd)', border: 'none',
            padding: '12px 28px', borderRadius: '12px', fontWeight: 600, color: '#ffffff',
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)', transition: 'transform 0.2s'
          }}
        >
          <Home size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export const Page404 = () => (
  <StatusPage
    code="404"
    title="Page Not Found"
    subtitle="The page you are looking for doesn't exist or has been moved to a different url."
    icon={AlertCircle}
  />
)

export const Page403 = () => (
  <StatusPage
    code="403"
    title="Access Denied"
    subtitle="You do not have the required permissions to access this secured dashboard area."
    icon={ShieldAlert}
  />
)

export const Page500 = () => (
  <StatusPage
    code="500"
    title="Server Error"
    subtitle="Our servers are experiencing an internal outage. Please check back in a few moments."
    icon={ShieldAlert}
  />
)

export const PageOffline = () => (
  <StatusPage
    title="You are Offline"
    subtitle="Please check your internet connectivity. Atlas One will automatically sync when connection returns."
    icon={WifiOff}
  />
)

export const PageMaintenance = () => (
  <StatusPage
    title="Under Scheduled Maintenance"
    subtitle="We are performing system upgrades. Atlas One will be back online shortly."
    icon={Settings}
  />
)
