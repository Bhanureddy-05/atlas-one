import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRegister } from '@/hooks/useApi'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Lock, Mail, User, ShieldAlert } from 'lucide-react'
import logo from '@/assets/logo.svg'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useRegister()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !username || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    register.mutate(
      { email, username, full_name: fullName, password },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token)
          toast.success('Successfully registered!')
          navigate('/')
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.detail || 'Registration failed'
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src={logo}
            alt="Atlas One Logo"
            style={{
              width: 64, height: 64, borderRadius: 12,
              margin: '0 auto 16px',
              display: 'block'
            }}
          />
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 24, color: '#f1f5f9' }}>Create Account</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Get started with Atlas One</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                className="input-field"
                placeholder="Bhanu Pratap"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                className="input-field"
                placeholder="bhanu"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="email"
                className="input-field"
                placeholder="bhanu@atlasone.app"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
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
            disabled={register.isPending}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
          >
            {register.isPending ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
