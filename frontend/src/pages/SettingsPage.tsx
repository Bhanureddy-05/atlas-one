import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Trash2, Eye, Shield, Download, Upload, FileSpreadsheet, Calendar, Settings } from 'lucide-react'
import { useUpdateProfile, useChangePassword } from '@/hooks/useApi'
import { useAuthStore } from '@/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [isCalendarLinked, setIsCalendarLinked] = useState(false)
  const [calendarInfo, setCalendarInfo] = useState<any>(null)
  const [oauthCode, setOauthCode] = useState('')

  const fetchCalendarStatus = async () => {
    try {
      const res = await api.get('/api/calendar/status')
      setIsCalendarLinked(res.data.linked)
      setCalendarInfo(res.data)
    } catch (err) {
      // fail silently
    }
  }

  useEffect(() => {
    fetchCalendarStatus()
  }, [])

  const handleConnectCalendar = async () => {
    if (!oauthCode.trim()) {
      toast.error('Please enter a valid authorization code')
      return
    }
    const tid = toast.loading('Linking Google Calendar...')
    try {
      await api.post('/api/calendar/link', { auth_code: oauthCode })
      toast.success('Google Calendar linked successfully! 🎉', { id: tid })
      setOauthCode('')
      fetchCalendarStatus()
    } catch (err) {
      toast.error('Failed to link Google Calendar', { id: tid })
    }
  }

  const handleDisconnectCalendar = async () => {
    const tid = toast.loading('Disconnecting Google Calendar...')
    try {
      await api.delete('/api/calendar/unlink')
      toast.success('Google Calendar disconnected successfully!', { id: tid })
      fetchCalendarStatus()
    } catch (err) {
      toast.error('Failed to disconnect Google Calendar', { id: tid })
    }
  }

  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || '', bio: user?.bio || '' })
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' })

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(
      { full_name: profileForm.full_name, bio: profileForm.bio },
      {
        onSuccess: (data) => {
          updateUser({ full_name: data.full_name, bio: data.bio })
        }
      }
    )
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.new_password !== passForm.confirm_password) {
      toast.error("New passwords don't match")
      return
    }

    changePassword.mutate(
      { current_password: passForm.current_password, new_password: passForm.new_password },
      {
        onSuccess: () => {
          setPassForm({ current_password: '', new_password: '', confirm_password: '' })
        }
      }
    )
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportBackup = async () => {
    try {
      const response = await api.get('/api/export/backup', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `atlas_one_backup_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Backup file downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download backup')
    }
  }

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const toastId = toast.loading('Restoring database backup...')
    try {
      await api.post('/api/export/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Database restored successfully! Reloading...', { id: toastId })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      toast.error('Failed to restore database from backup file', { id: toastId })
    }
  }

  const handleExportCSV = async (type: string) => {
    try {
      const response = await api.get(`/api/export/csv/${type}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `atlas_one_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`${type.toUpperCase()} CSV log downloaded!`)
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">⚙️ Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Manage your account profile, credentials, and preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <User size={18} color="#3b82f6" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Edit Profile</h3>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Full Name</label>
              <input
                className="input-field"
                value={profileForm.full_name}
                onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Short Bio</label>
              <textarea
                className="input-field"
                value={profileForm.bio}
                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Updating...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* App Preferences Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Settings size={18} color="#3b82f6" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>App Preferences</h3>
          </div>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Timezone</label>
              <select
                className="input-field"
                defaultValue="Asia/Kolkata"
                onChange={e => {
                  localStorage.setItem('atlas_one_timezone', e.target.value)
                  toast.success('Timezone updated!')
                }}
                style={{ background: '#111827', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0/BST)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Theme Preference</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Dark Theme', 'Light Theme (Coming Soon)'].map((themeName, idx) => (
                  <button
                    key={themeName}
                    type="button"
                    onClick={() => {
                      if (idx === 0) toast.success('Dark theme active')
                      else toast.error('Light theme is under development for SaaS dashboard release!')
                    }}
                    className={idx === 0 ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: 12 }}
                  >
                    {themeName}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>Notification Triggers</label>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { key: 'email_alerts', label: 'Email weekly summaries' },
                  { key: 'study_reminders', label: 'Study Pomodoro session reminders' },
                  { key: 'streak_alerts', label: 'Streak depletion warnings (Streak Shield alert)' }
                ].map((notifOption) => (
                  <label key={notifOption.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={(e) => toast.success(`${notifOption.label} updated!`)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{notifOption.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Lock size={18} color="#3b82f6" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passForm.current_password}
                onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={passForm.new_password}
                  onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={passForm.confirm_password}
                  onChange={e => setPassForm(f => ({ ...f, confirm_password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={changePassword.isPending}>
              Change Password
            </button>
          </form>
        </div>

        {/* Integrations Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Calendar size={18} color="#4F7CFF" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Integrations & API Sync</h3>
          </div>
          
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                    📅 Google Calendar Sync
                  </h4>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Two-way synchronization for study sessions, habits, and fitness milestones.
                  </p>
                </div>
                <div>
                  <span className={`badge ${isCalendarLinked ? 'badge-success' : 'badge-secondary'}`} style={{ textTransform: 'uppercase', fontSize: 10 }}>
                    {isCalendarLinked ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {calendarInfo && (
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                  <strong>Client ID:</strong> <code style={{ color: '#ec4899', fontSize: 11 }}>{calendarInfo.client_id}</code>
                  <div style={{ marginTop: 6 }}>{calendarInfo.instructions}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {isCalendarLinked ? (
                  <button className="btn-secondary" onClick={handleDisconnectCalendar} style={{ fontSize: 13 }}>
                    Disconnect Calendar
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter OAuth Authorization Code"
                      value={oauthCode}
                      onChange={e => setOauthCode(e.target.value)}
                      style={{ flex: 1, height: 38, minWidth: 200 }}
                    />
                    <button className="btn-primary" onClick={handleConnectCalendar} style={{ height: 38, fontSize: 13, background: 'linear-gradient(135deg, #4F7CFF, #8B5CF6)', border: 'none' }}>
                      Link Google Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Backup export data */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={18} color="#3b82f6" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Data Backup & Restore</h3>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
            Backup your database locally as a JSON file or restore from a previous save. You can also download individual log sheets as CSV files.
          </p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreBackup}
            accept=".json"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'grid', gap: 20 }}>
            {/* Core Backup Restore */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleExportBackup} style={{ gap: 8 }}>
                <Download size={15} /> Export JSON Backup
              </button>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ gap: 8 }}>
                <Upload size={15} /> Restore JSON Backup
              </button>
            </div>

            {/* CSV Exports */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileSpreadsheet size={15} color="#06b6d4" /> CSV Log Exports
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['habits', 'study', 'fitness', 'diet', 'sleep'].map((logType) => (
                  <button
                    key={logType}
                    className="btn-secondary"
                    onClick={() => handleExportCSV(logType)}
                    style={{ fontSize: 12, padding: '6px 12px', textTransform: 'capitalize' }}
                  >
                    {logType} Log
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
