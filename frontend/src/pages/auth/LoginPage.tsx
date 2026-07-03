import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLogin } from '@/hooks/useApi'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Lock, Mail, ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token)
          toast.success('Successfully logged in!')
          navigate('/')
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.detail || 'Invalid email or password'
          toast.error(errMsg)
        },
      }
    )
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="BHANOVA Logo"
            style={{
              width: 64, height: 64, borderRadius: 12,
              margin: '0 auto 16px',
              display: 'block'
            }}
          />
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 24, color: '#f1f5f9' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Sign in to continue to BHANOVA</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="email"
                className="input-field"
                placeholder="yourname@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={login.isPending}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
          >
            {login.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
