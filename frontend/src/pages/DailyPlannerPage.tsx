import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, Clock, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react'
import { usePlannerTasks, useCreatePlannerTask, useUpdatePlannerTask, useDeletePlannerTask, useLogPomodoro } from '@/hooks/useApi'
import { getTodayString } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DailyPlannerPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const { data: tasks, isLoading: tasksLoading } = usePlannerTasks(selectedDate)
  const createTask = useCreatePlannerTask()
  const updateTask = useUpdatePlannerTask()
  const deleteTask = useDeletePlannerTask()
  const logPomo = useLogPomodoro()

  // Task Form State
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', hour_slot: '', priority: 'medium', category: 'study' })

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimerRunning(false)
            handlePomodoroComplete()
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerRunning])

  const handlePomodoroComplete = () => {
    logPomo.mutate({
      date: getTodayString(),
      task_name: 'Pomodoro Focused Block',
      duration_minutes: 25,
      completed: true
    }, {
      onSuccess: () => {
        toast.success('🍅 Great job! Pomodoro session logged.')
      }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title) return

    createTask.mutate(
      {
        date: selectedDate,
        title: taskForm.title,
        hour_slot: taskForm.hour_slot ? parseInt(taskForm.hour_slot) : null,
        priority: taskForm.priority,
        category: taskForm.category
      },
      {
        onSuccess: () => {
          setTaskForm({ title: '', hour_slot: '', priority: 'medium', category: 'study' })
          setShowTaskForm(false)
          toast.success('Task scheduled!')
        }
      }
    )
  }

  const handleToggleTask = (id: number, currentlyCompleted: boolean) => {
    updateTask.mutate({
      id,
      data: { is_completed: !currentlyCompleted }
    })
  }

  // Create Hour list (4 AM to 11 PM)
  const hours = Array.from({ length: 20 }, (_, i) => i + 4)

  const completedPct = tasks?.length ? Math.round((tasks.filter((t: any) => t.is_completed).length / tasks.length) * 100) : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">📅 Daily Planner</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Organize your day hour-by-hour, track priorities, and use Pomodoro timers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto' }}
          />
          <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
            <Plus size={16} /> Schedule Task
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Hour slots planner */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Today's Timeline</h3>
            <span className="badge badge-success">{completedPct}% Completed</span>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {hours.map((hr) => {
              const task = tasks?.find((t: any) => t.hour_slot === hr)
              const timeLabel = hr === 12 ? '12:00 PM' : hr > 12 ? `${hr - 12}:00 PM` : `${hr}:00 AM`
              return (
                <div
                  key={hr}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: task ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderLeft: task ? `3px solid ${task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'}` : '3px solid transparent'
                  }}
                >
                  <div style={{ width: 80, fontSize: 12, color: '#64748b', fontWeight: 600 }}>{timeLabel}</div>
                  
                  {task ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        onClick={() => handleToggleTask(task.id, task.is_completed)}
                        style={{
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          color: task.is_completed ? '#64748b' : '#e2e8f0',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {task.title}
                      </div>
                      <button
                        onClick={() => deleteTask.mutate(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setTaskForm(f => ({ ...f, hour_slot: String(hr) })); setShowTaskForm(true); }}
                      style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      + Add Task
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Pomodoro Timer & Priority checklist */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Pomodoro Card */}
          <div className="glass-card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>🍅 Pomodoro Timer</h3>
            
            <div style={{ position: 'relative', width: 180, height: 180, margin: '10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <motion.circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="url(#pomoGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - timeLeft / (25 * 60)) }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
                />
                <defs>
                  <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8A00" />
                    <stop offset="100%" stopColor="#FF4D4D" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner content with breathing pulse */}
              <motion.div
                animate={timerRunning ? { scale: [1, 1.04, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {formatTime(timeLeft)}
                </span>
                <span style={{ fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontWeight: 700 }}>
                  {timerRunning ? 'FOCUSING' : 'IDLE'}
                </span>
              </motion.div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, width: '100%' }}>
              <button className="btn-primary" onClick={() => setTimerRunning(!timerRunning)} style={{ flex: 1 }}>
                {timerRunning ? <Pause size={16} /> : <Play size={16} />} {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button className="btn-secondary" onClick={() => { setTimerRunning(false); setTimeLeft(25 * 60); }} style={{ padding: 12 }}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Priority checklist */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Priority Tasks</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {tasks?.filter((t: any) => !t.hour_slot).map((task: any) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    style={{
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? '#64748b' : '#e2e8f0',
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    {task.title}
                  </div>
                  <button
                    onClick={() => deleteTask.mutate(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add Task Modal */}
      {showTaskForm && (
        <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Schedule Task</h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Task Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Solve 2 LeetCode problems"
                  value={taskForm.title}
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Hour Slot (optional)</label>
                  <select
                    className="input-field"
                    value={taskForm.hour_slot}
                    onChange={e => setTaskForm(f => ({ ...f, hour_slot: e.target.value }))}
                  >
                    <option value="">No specific slot</option>
                    {hours.map(hr => (
                      <option key={hr} value={hr}>
                        {hr === 12 ? '12:00 PM' : hr > 12 ? `${hr - 12}:00 PM` : `${hr}:00 AM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Priority</label>
                  <select
                    className="input-field"
                    value={taskForm.priority}
                    onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" type="button" onClick={() => setShowTaskForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
