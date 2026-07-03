import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const useLogin = () => useMutation({
  mutationFn: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),
})

export const useRegister = () => useMutation({
  mutationFn: (data: { email: string; username: string; full_name: string; password: string }) =>
    api.post('/auth/register', data).then(r => r.data),
})

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboard = () => useQuery({
  queryKey: ['dashboard'],
  queryFn: () => api.get('/dashboard/summary').then(r => r.data),
  refetchInterval: 60000,
})

// ── Habits ────────────────────────────────────────────────────────────────────
export const useHabits = () => useQuery({
  queryKey: ['habits'],
  queryFn: () => api.get('/habits').then(r => r.data),
})

export const useTodayHabits = () => useQuery({
  queryKey: ['habits', 'today'],
  queryFn: () => api.get('/habits/today').then(r => r.data),
  refetchInterval: 30000,
})

export const useCreateHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/habits', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      toast.success('Habit created!')
    },
  })
}

export const useLogHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { habit_id: number; date: string; completed: boolean }) =>
      api.post('/habits/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/habits/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      toast.success('Habit deleted')
    },
  })
}

// ── Study ─────────────────────────────────────────────────────────────────────
export const useStudyTopics = () => useQuery({
  queryKey: ['study', 'topics'],
  queryFn: () => api.get('/study/topics').then(r => r.data),
})

export const useCreateStudyTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/study/topics', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study'] })
      toast.success('Topic created!')
    },
  })
}

export const useUpdateStudyTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/study/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study'] }),
  })
}

export const useStudySessions = (params?: { start_date?: string; end_date?: string }) => useQuery({
  queryKey: ['study', 'sessions', params],
  queryFn: () => api.get('/study/sessions', { params }).then(r => r.data),
})

export const useCreateStudySession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/study/sessions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Study session logged!')
    },
  })
}

// ── DSA ───────────────────────────────────────────────────────────────────────
export const useDSATopics = () => useQuery({
  queryKey: ['dsa', 'topics'],
  queryFn: () => api.get('/dsa/topics').then(r => r.data),
})

export const useDSAStats = () => useQuery({
  queryKey: ['dsa', 'stats'],
  queryFn: () => api.get('/dsa/stats').then(r => r.data),
})

export const useDSAProblems = (params?: any) => useQuery({
  queryKey: ['dsa', 'problems', params],
  queryFn: () => api.get('/dsa/problems', { params }).then(r => r.data),
})

export const useCreateDSATopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/dsa/topics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

export const useUpdateDSATopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/dsa/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

export const useCreateDSAProblem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/dsa/problems', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dsa'] })
      toast.success('Problem added!')
    },
  })
}

export const useUpdateDSAProblem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/dsa/problems/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

// ── Interview ─────────────────────────────────────────────────────────────────
export const useInterviewTopics = () => useQuery({
  queryKey: ['interview', 'topics'],
  queryFn: () => api.get('/interview/topics').then(r => r.data),
})

export const useInterviewReadiness = () => useQuery({
  queryKey: ['interview', 'readiness'],
  queryFn: () => api.get('/interview/readiness').then(r => r.data),
})

export const useCreateInterviewTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/interview/topics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interview'] }),
  })
}

export const useUpdateInterviewTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/interview/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interview'] }),
  })
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const useProjects = () => useQuery({
  queryKey: ['projects'],
  queryFn: () => api.get('/projects').then(r => r.data),
})

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/projects', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
    },
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/projects/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
  })
}

// ── Fitness ───────────────────────────────────────────────────────────────────
export const useFitnessLogs = (params?: any) => useQuery({
  queryKey: ['fitness', 'logs', params],
  queryFn: () => api.get('/fitness/logs', { params }).then(r => r.data),
})

export const useFitnessStats = () => useQuery({
  queryKey: ['fitness', 'stats'],
  queryFn: () => api.get('/fitness/stats').then(r => r.data),
})

export const useBodyMeasurements = () => useQuery({
  queryKey: ['fitness', 'measurements'],
  queryFn: () => api.get('/fitness/measurements').then(r => r.data),
})

export const useCreateFitnessLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/fitness/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitness'] })
      toast.success('Workout logged!')
    },
  })
}

export const useCreateBodyMeasurement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/fitness/measurements', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitness'] })
      toast.success('Measurement saved!')
    },
  })
}

// ── Diet ──────────────────────────────────────────────────────────────────────
export const useFoodLogs = (log_date?: string) => useQuery({
  queryKey: ['diet', 'logs', log_date],
  queryFn: () => api.get('/diet/logs', { params: { log_date } }).then(r => r.data),
})

export const useDietSummary = (log_date: string) => useQuery({
  queryKey: ['diet', 'summary', log_date],
  queryFn: () => api.get(`/diet/summary/${log_date}`).then(r => r.data),
  enabled: !!log_date,
})

export const useCreateFoodLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/diet/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diet'] })
      toast.success('Food logged!')
    },
  })
}

export const useDeleteFoodLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/diet/logs/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diet'] }),
  })
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
export const useSleepLogs = (params?: any) => useQuery({
  queryKey: ['sleep', 'logs', params],
  queryFn: () => api.get('/sleep', { params }).then(r => r.data),
})

export const useSleepStats = () => useQuery({
  queryKey: ['sleep', 'stats'],
  queryFn: () => api.get('/sleep/stats').then(r => r.data),
})

export const useCreateSleepLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/sleep', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep'] })
      toast.success('Sleep logged!')
    },
  })
}

// ── Singing ───────────────────────────────────────────────────────────────────
export const useSingingSessions = () => useQuery({
  queryKey: ['singing'],
  queryFn: () => api.get('/singing').then(r => r.data),
})

export const useSingingStats = () => useQuery({
  queryKey: ['singing', 'stats'],
  queryFn: () => api.get('/singing/stats').then(r => r.data),
})

export const useCreateSingingSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/singing', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['singing'] })
      toast.success('Singing session logged!')
    },
  })
}

// ── Reading ───────────────────────────────────────────────────────────────────
export const useBooks = (status?: string) => useQuery({
  queryKey: ['reading', 'books', status],
  queryFn: () => api.get('/reading/books', { params: status ? { status } : {} }).then(r => r.data),
})

export const useReadingStats = () => useQuery({
  queryKey: ['reading', 'stats'],
  queryFn: () => api.get('/reading/stats').then(r => r.data),
})

export const useCreateBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/reading/books', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading'] })
      toast.success('Book added!')
    },
  })
}

export const useUpdateBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/reading/books/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading'] }),
  })
}

export const useCreateReadingSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/reading/sessions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading'] })
      toast.success('Reading session logged!')
    },
  })
}

// ── Goals ─────────────────────────────────────────────────────────────────────
export const useGoals = (goal_type?: string) => useQuery({
  queryKey: ['goals', goal_type],
  queryFn: () => api.get('/goals', { params: goal_type ? { goal_type } : {} }).then(r => r.data),
})

export const useCreateGoal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/goals', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal created!')
    },
  })
}

export const useUpdateGoal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/goals/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export const useDeleteGoal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/goals/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted')
    },
  })
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const useAnalytics = (days = 30) => useQuery({
  queryKey: ['analytics', days],
  queryFn: () => api.get('/analytics/overview', { params: { days } }).then(r => r.data),
})

// ── Reports ───────────────────────────────────────────────────────────────────
export const useWeeklyReport = () => useQuery({
  queryKey: ['reports', 'weekly'],
  queryFn: () => api.get('/reports/weekly').then(r => r.data),
})

export const useMonthlyReport = () => useQuery({
  queryKey: ['reports', 'monthly'],
  queryFn: () => api.get('/reports/monthly').then(r => r.data),
})

export const useYearlyReport = () => useQuery({
  queryKey: ['reports', 'yearly'],
  queryFn: () => api.get('/reports/yearly').then(r => r.data),
})

// ── Planner ───────────────────────────────────────────────────────────────────
export const usePlannerTasks = (task_date?: string) => useQuery({
  queryKey: ['planner', 'tasks', task_date],
  queryFn: () => api.get('/planner/tasks', { params: task_date ? { task_date } : {} }).then(r => r.data),
})

export const useCreatePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/planner/tasks', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useUpdatePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/planner/tasks/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useDeletePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/planner/tasks/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useLogPomodoro = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/planner/pomodoro', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

// ── User ──────────────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.put('/users/me', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated!')
    },
  })
}

export const useChangePassword = () => useMutation({
  mutationFn: (data: any) => api.post('/users/change-password', data).then(r => r.data),
  onSuccess: () => toast.success('Password changed!'),
  onError: () => toast.error('Current password is incorrect'),
})
