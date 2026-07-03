import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Shield, Target, Plus, Send, Check, X, ShieldAlert, Key } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function SharingPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [activeGroup, setActiveGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create Group Form
  const [groupName, setGroupName] = useState('')
  // Invite User Form
  const [inviteEmail, setInviteEmail] = useState('')
  // Create Shared Goal Form
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalCat, setGoalCat] = useState('fitness')

  // Privacy controls
  const [sharingEnabled, setSharingEnabled] = useState(true)

  const fetchData = async () => {
    try {
      const gRes = await api.get('/sharing/groups')
      setGroups(gRes.data)
      
      if (gRes.data.length > 0) {
        const firstGroup = gRes.data[0]
        setActiveGroup(firstGroup)
        fetchGroupDetails(firstGroup.id)
      }
      
      const invRes = await api.get('/sharing/invitations')
      setInvites(invRes.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  const fetchGroupDetails = async (groupId: number) => {
    try {
      const mRes = await api.get(`/sharing/groups/${groupId}/members`)
      setMembers(mRes.data)

      const glRes = await api.get(`/sharing/groups/${groupId}/goals`)
      setGoals(glRes.data)
    } catch (e) {
      toast.error('Failed to load group details')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    try {
      const res = await api.post('/sharing/groups', { name: groupName.trim() })
      toast.success('👥 Family group created successfully!')
      setGroupName('')
      fetchData()
    } catch (err) {
      toast.error('Failed to create group')
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !activeGroup) return

    try {
      await api.post('/sharing/invite', {
        group_id: activeGroup.id,
        email: inviteEmail.trim()
      })
      toast.success(`✉️ Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } catch (err) {
      toast.error('Failed to send invitation')
    }
  }

  const handleCreateSharedGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim() || !goalTarget || !activeGroup) return

    try {
      await api.post('/sharing/goals', {
        group_id: activeGroup.id,
        title: goalTitle.trim(),
        description: goalDesc.trim() || null,
        target_value: parseInt(goalTarget),
        category: goalCat
      })
      toast.success('🎯 Shared team goal established!')
      setGoalTitle('')
      setGoalDesc('')
      setGoalTarget('')
      fetchGroupDetails(activeGroup.id)
    } catch (err) {
      toast.error('Failed to create shared goal')
    }
  }

  const handleRespondInvite = async (inviteId: number, accept: boolean) => {
    try {
      await api.post(`/sharing/invitations/${inviteId}/respond?accept=${accept}`)
      toast.success(accept ? 'Joined group!' : 'Invitation declined')
      fetchData()
    } catch (e) {
      toast.error('Failed to respond to invitation')
    }
  }

  const handleGroupSelect = (group: any) => {
    setActiveGroup(group)
    fetchGroupDetails(group.id)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">👥 Family Sharing & Groups</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Sync habit streaks, coordinate shared goals, and manage group-wide fitness challenges.
          </p>
        </div>

        {/* Privacy Toggle */}
        <button
          onClick={() => {
            setSharingEnabled(!sharingEnabled)
            toast.success(sharingEnabled ? 'Sharing disabled. Your data is private.' : 'Sharing enabled. You can connect with friends.')
          }}
          className={sharingEnabled ? 'btn-primary' : 'btn-danger'}
          style={{ gap: 6 }}
        >
          <Shield size={15} /> {sharingEnabled ? 'Sharing Active' : 'Sharing Paused'}
        </button>
      </div>

      {!sharingEnabled ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', display: 'grid', gap: 16 }}>
          <ShieldAlert size={48} color="#ef4444" style={{ justifySelf: 'center' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Family Sharing is Disabled</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
            You have paused all sharing connectivity. Toggle Sharing Active at the top right to create or join family vaults.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 24, alignItems: 'start' }}>
          
          {/* Left Column: Group List & Invites */}
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Create / Select Group */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Your Sharing Groups</h3>
              
              {groups.length > 0 ? (
                <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleGroupSelect(g)}
                      style={{
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                        borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%',
                        background: activeGroup?.id === g.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                        color: activeGroup?.id === g.id ? '#818cf8' : '#e2e8f0',
                        fontWeight: activeGroup?.id === g.id ? 700 : 500
                      }}
                    >
                      <Users size={15} />
                      <span>{g.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Not in any groups yet.</p>
              )}

              <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="New Group Name"
                  className="input-field"
                  style={{ height: 36, fontSize: 12 }}
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
                <button type="submit" className="btn-secondary" style={{ padding: '6px 12px' }}>Create</button>
              </form>
            </div>

            {/* Pending Group Invitations */}
            {invites.length > 0 && (
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Pending Invites ({invites.length})</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {invites.map(inv => (
                    <div
                      key={inv.invitation_id}
                      style={{
                        padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{inv.group_name}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Join this group</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleRespondInvite(inv.invitation_id, true)}
                          style={{ border: 'none', background: '#10b981', color: 'white', padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => handleRespondInvite(inv.invitation_id, false)}
                          style={{ border: 'none', background: '#ef4444', color: 'white', padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Group Details & Shared Goals */}
          {activeGroup ? (
            <div style={{ display: 'grid', gap: 24 }}>
              
              {/* Group Metadata & Members */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{activeGroup.name}</h2>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Manage group roles and send invite links.</p>
                  </div>

                  {/* Invite Member Inline Form */}
                  <form onSubmit={handleInviteUser} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      placeholder="Invite by Email"
                      type="email"
                      className="input-field"
                      style={{ height: 36, width: 180, fontSize: 12 }}
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '6px 12px', gap: 4, fontSize: 12 }}>
                      <UserPlus size={13} /> Invite
                    </button>
                  </form>
                </div>

                {/* Members list */}
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Members</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {members.map(m => (
                    <div
                      key={m.user_id}
                      style={{
                        padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10
                      }}
                    >
                      <div style={{ fontSize: 18 }}>👨‍💻</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{m.full_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Shield size={10} color="#818cf8" /> {m.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Goals / Challenges */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} color="#06b6d4" /> Shared Challenges & Milestones
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
                  {/* Goals List */}
                  <div style={{ display: 'grid', gap: 16 }}>
                    {goals.length > 0 ? (
                      goals.map(g => {
                        const progressPercent = min(round((g.current_value / g.target_value) * 100), 100)
                        return (
                          <div
                            key={g.id}
                            style={{
                              padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.01)',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{g.title}</h4>
                              <span style={{ fontSize: 11, color: '#64748b' }}>{g.category.toUpperCase()}</span>
                            </div>
                            {g.description && <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 12px 0' }}>{g.description}</p>}
                            
                            {/* Progress bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1', marginBottom: 4 }}>
                              <span>Progress</span>
                              <span>{g.current_value} / {g.target_value} ({progressPercent}%)</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#06b6d4', borderRadius: 3 }} />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 12 }}>
                        No shared challenges established for this group.
                      </div>
                    )}
                  </div>

                  {/* Create Shared Goal Form */}
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Launch Challenge</h4>
                    <form onSubmit={handleCreateSharedGoal} style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>Challenge Title</label>
                        <input
                          placeholder="e.g. 100km Cardio Sprint"
                          className="input-field"
                          style={{ fontSize: 12 }}
                          value={goalTitle}
                          onChange={e => setGoalTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>Description</label>
                        <input
                          placeholder="Short description..."
                          className="input-field"
                          style={{ fontSize: 12 }}
                          value={goalDesc}
                          onChange={e => setGoalDesc(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>Target Value</label>
                          <input
                            type="number"
                            placeholder="e.g. 10000"
                            className="input-field"
                            style={{ fontSize: 12 }}
                            value={goalTarget}
                            onChange={e => setGoalTarget(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }}>Category</label>
                          <select
                            className="input-field"
                            style={{ background: '#10101e', height: 38, fontSize: 12, padding: 4 }}
                            value={goalCat}
                            onChange={e => setGoalCat(e.target.value)}
                          >
                            <option value="fitness">Fitness 🏃</option>
                            <option value="study">Study 📚</option>
                            <option value="dsa">DSA Practice 💻</option>
                            <option value="habits">Habits ⚡</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="btn-secondary" style={{ width: '100%', gap: 6, fontSize: 12 }}>
                        <Plus size={13} /> Launch Team Challenge
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Select a group on the left or create a new family group to synchronize trackers.
            </div>
          )}

        </div>
      )}
    </div>
  )
}

// Helpers
function min(a: number, b: number) {
  return a < b ? a : b
}
function round(val: number) {
  return Math.round(val)
}
