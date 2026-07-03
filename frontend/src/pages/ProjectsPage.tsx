import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderGit2, Trash2, Edit2, Link } from 'lucide-react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useApi'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', technology: '', github_url: '', start_date: '', target_completion: '' })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    createProject.mutate(
      {
        name: form.name,
        description: form.description || null,
        technology: form.technology || null,
        github_url: form.github_url || null,
        start_date: form.start_date || null,
        target_completion: form.target_completion || null
      },
      {
        onSuccess: () => {
          setForm({ name: '', description: '', technology: '', github_url: '', start_date: '', target_completion: '' })
          setShowAddForm(false)
        }
      }
    )
  }

  const handleStatusChange = (id: number, status: string) => {
    updateProject.mutate({
      id,
      data: { status, progress_percent: status === 'completed' ? 100 : status === 'planning' ? 0 : 50 }
    }, {
      onSuccess: () => {
        toast.success('Project status updated!')
      }
    })
  }

  const handleProgressChange = (id: number, pct: number) => {
    updateProject.mutate({
      id,
      data: { progress_percent: pct }
    })
  }

  const columns = [
    { id: 'planning', title: '📋 Planning', color: '#fbbf24' },
    { id: 'in_progress', title: '⚡ In Progress', color: '#6366f1' },
    { id: 'completed', title: '✅ Completed', color: '#10b981' },
    { id: 'on_hold', title: '⏸ On Hold', color: '#64748b' }
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">🗂 Project Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Manage development projects, track progress % and repository links.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, overflowX: 'auto', minHeight: '60vh', alignItems: 'start' }}>
        {columns.map(col => {
          const colProjects = projects?.filter((p: any) => p.status === col.id) || []
          return (
            <div
              key={col.id}
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: 16,
                minHeight: '500px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{col.title}</h3>
                <span className="badge badge-primary">{colProjects.length}</span>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {colProjects.map((project: any) => (
                  <motion.div
                    key={project.id}
                    className="glass-card"
                    style={{ padding: 16, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}
                    whileHover={{ y: -2 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{project.name}</h4>
                      <button
                        onClick={() => deleteProject.mutate(project.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.4 }}>
                      {project.description || 'No description provided.'}
                    </p>

                    {project.technology && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                        {project.technology.split(',').map((tech: string) => (
                          <span key={tech} className="badge badge-info" style={{ fontSize: 10, padding: '2px 6px' }}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Progress Slider */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        <span>Progress</span>
                        <span>{project.progress_percent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="100"
                        value={project.progress_percent}
                        onChange={(e) => handleProgressChange(project.id, parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Footer Links & Status Changer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {project.github_url ? (
                        <a
                          href={project.github_url} target="_blank" rel="noreferrer"
                          style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, textDecoration: 'none' }}
                        >
                          <FolderGit2 size={14} /> Repository
                        </a>
                      ) : <span />}

                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          color: '#e2e8f0',
                          fontSize: 11,
                          padding: '2px 6px',
                          outline: 'none'
                        }}
                      >
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>New Project</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Project Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. BHANOVA Dashboard"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Description</label>
                <textarea
                  className="input-field"
                  placeholder="Describe your project goals..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Technologies (comma separated)</label>
                <input
                  className="input-field"
                  placeholder="e.g. React, FastApi, PostgreSQL"
                  value={form.technology}
                  onChange={e => setForm(f => ({ ...f, technology: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>GitHub URL</label>
                <input
                  className="input-field"
                  placeholder="https://github.com/username/repo"
                  value={form.github_url}
                  onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
