import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const useLogin = () => useMutation({
  mutationFn: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data).then(r => r.data),
})

export const useRegister = () => useMutation({
  mutationFn: (data: { email: string; username: string; full_name: string; password: string }) =>
    api.post("/api/auth/register", data).then(r => r.data),
})

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboard = () => useQuery({
  queryKey: ['dashboard'],
  queryFn: () => api.get('/api/dashboard/summary').then(r => r.data),
  refetchInterval: 60000,
})

// ── Habits ────────────────────────────────────────────────────────────────────
export const useHabits = () => useQuery({
  queryKey: ['habits'],
  queryFn: () => api.get('/api/habits').then(r => r.data),
})

export const useTodayHabits = () => useQuery({
  queryKey: ['habits', 'today'],
  queryFn: () => api.get('/api/habits/today').then(r => r.data),
  refetchInterval: 30000,
})

export const useCreateHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/habits', data).then(r => r.data),
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
      api.post('/api/habits/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/habits/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      toast.success('Habit deleted')
    },
  })
}

// ── Study ─────────────────────────────────────────────────────────────────────
export const useStudyTopics = () => useQuery({
  queryKey: ['study', 'topics'],
  queryFn: () => api.get('/api/study/topics').then(r => r.data),
})

export const useCreateStudyTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/study/topics', data).then(r => r.data),
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
      api.put(`/api/study/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['study'] }),
  })
}

export const useStudySessions = (params?: { start_date?: string; end_date?: string }) => useQuery({
  queryKey: ['study', 'sessions', params],
  queryFn: () => api.get('/api/study/sessions', { params }).then(r => r.data),
})

export const useCreateStudySession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/study/sessions', data).then(r => r.data),
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
  queryFn: () => api.get('/api/dsa/topics').then(r => r.data),
})

export const useDSAStats = () => useQuery({
  queryKey: ['dsa', 'stats'],
  queryFn: () => api.get('/api/dsa/stats').then(r => r.data),
})

export const useDSAProblems = (params?: any) => useQuery({
  queryKey: ['dsa', 'problems', params],
  queryFn: () => api.get('/api/dsa/problems', { params }).then(r => r.data),
})

export const useCreateDSATopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/dsa/topics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

export const useUpdateDSATopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/dsa/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

export const useCreateDSAProblem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/dsa/problems', data).then(r => r.data),
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
      api.put(`/api/dsa/problems/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dsa'] }),
  })
}

// ── Interview ─────────────────────────────────────────────────────────────────
export const useInterviewTopics = () => useQuery({
  queryKey: ['interview', 'topics'],
  queryFn: () => api.get('/api/interview/topics').then(r => r.data),
})

export const useInterviewReadiness = () => useQuery({
  queryKey: ['interview', 'readiness'],
  queryFn: () => api.get('/api/interview/readiness').then(r => r.data),
})

export const useCreateInterviewTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/interview/topics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interview'] }),
  })
}

export const useUpdateInterviewTopic = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/interview/topics/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interview'] }),
  })
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const useProjects = () => useQuery({
  queryKey: ['projects'],
  queryFn: () => api.get('/api/projects').then(r => r.data),
})

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/projects', data).then(r => r.data),
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
      api.put(`/api/projects/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/projects/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
  })
}

// ── Fitness ───────────────────────────────────────────────────────────────────
export const useFitnessLogs = (params?: any) => useQuery({
  queryKey: ['fitness', 'logs', params],
  queryFn: () => api.get('/api/fitness/logs', { params }).then(r => r.data),
})

export const useFitnessStats = () => useQuery({
  queryKey: ['fitness', 'stats'],
  queryFn: () => api.get('/api/fitness/stats').then(r => r.data),
})

export const useBodyMeasurements = () => useQuery({
  queryKey: ['fitness', 'measurements'],
  queryFn: () => api.get('/api/fitness/measurements').then(r => r.data),
})

export const useCreateFitnessLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/fitness/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitness'] })
      toast.success('Workout logged!')
    },
  })
}

export const useCreateBodyMeasurement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/fitness/measurements', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitness'] })
      toast.success('Measurement saved!')
    },
  })
}

// ── Diet ──────────────────────────────────────────────────────────────────────
export const useFoodLogs = (log_date?: string) => useQuery({
  queryKey: ['diet', 'logs', log_date],
  queryFn: () => api.get('/api/diet/logs', { params: { log_date } }).then(r => r.data),
})

export const useDietSummary = (log_date: string) => useQuery({
  queryKey: ['diet', 'summary', log_date],
  queryFn: () => api.get(`/api/diet/summary/${log_date}`).then(r => r.data),
  enabled: !!log_date,
})

export const useCreateFoodLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/diet/logs', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diet'] })
      toast.success('Food logged!')
    },
  })
}

export const useDeleteFoodLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/diet/logs/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diet'] }),
  })
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
export const useSleepLogs = (params?: any) => useQuery({
  queryKey: ['sleep', 'logs', params],
  queryFn: () => api.get('/api/sleep', { params }).then(r => r.data),
})

export const useSleepStats = () => useQuery({
  queryKey: ['sleep', 'stats'],
  queryFn: () => api.get('/api/sleep/stats').then(r => r.data),
})

export const useCreateSleepLog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/sleep', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep'] })
      toast.success('Sleep logged!')
    },
  })
}

// ── Singing ───────────────────────────────────────────────────────────────────
export const useSingingSessions = () => useQuery({
  queryKey: ['singing'],
  queryFn: () => api.get('/api/singing').then(r => r.data),
})

export const useSingingStats = () => useQuery({
  queryKey: ['singing', 'stats'],
  queryFn: () => api.get('/api/singing/stats').then(r => r.data),
})

export const useCreateSingingSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/singing', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['singing'] })
      toast.success('Singing session logged!')
    },
  })
}

// ── Reading ───────────────────────────────────────────────────────────────────
export const useBooks = (status?: string) => useQuery({
  queryKey: ['reading', 'books', status],
  queryFn: () => api.get('/api/reading/books', { params: status ? { status } : {} }).then(r => r.data),
})

export const useReadingStats = () => useQuery({
  queryKey: ['reading', 'stats'],
  queryFn: () => api.get('/api/reading/stats').then(r => r.data),
})

export const useCreateBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/reading/books', data).then(r => r.data),
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
      api.put(`/api/reading/books/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading'] }),
  })
}

export const useCreateReadingSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/reading/sessions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading'] })
      toast.success('Reading session logged!')
    },
  })
}

// ── Goals ─────────────────────────────────────────────────────────────────────
export const useGoals = (goal_type?: string) => useQuery({
  queryKey: ['goals', goal_type],
  queryFn: () => api.get('/api/goals', { params: goal_type ? { goal_type } : {} }).then(r => r.data),
})

export const useCreateGoal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/goals', data).then(r => r.data),
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
      api.put(`/api/goals/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export const useDeleteGoal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/goals/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted')
    },
  })
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const useAnalytics = (days = 30) => useQuery({
  queryKey: ['analytics', days],
  queryFn: () => api.get('/api/analytics/overview', { params: { days } }).then(r => r.data),
})

// ── Reports ───────────────────────────────────────────────────────────────────
export const useWeeklyReport = () => useQuery({
  queryKey: ['reports', 'weekly'],
  queryFn: () => api.get('/api/reports/weekly').then(r => r.data),
})

export const useMonthlyReport = () => useQuery({
  queryKey: ['reports', 'monthly'],
  queryFn: () => api.get('/api/reports/monthly').then(r => r.data),
})

export const useYearlyReport = () => useQuery({
  queryKey: ['reports', 'yearly'],
  queryFn: () => api.get('/api/reports/yearly').then(r => r.data),
})

// ── Planner ───────────────────────────────────────────────────────────────────
export const usePlannerTasks = (task_date?: string) => useQuery({
  queryKey: ['planner', 'tasks', task_date],
  queryFn: () => api.get('/api/planner/tasks', { params: task_date ? { task_date } : {} }).then(r => r.data),
})

export const useCreatePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/planner/tasks', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useUpdatePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/planner/tasks/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useDeletePlannerTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/planner/tasks/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export const useLogPomodoro = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/planner/pomodoro', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

// ── User ──────────────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.put('/api/users/me', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated!')
    },
  })
}

export const useChangePassword = () => useMutation({
  mutationFn: (data: any) => api.post('/api/users/change-password', data).then(r => r.data),
  onSuccess: () => toast.success('Password changed!'),
  onError: () => toast.error('Current password is incorrect'),
})

// ── Machine Learning & AI Analytics ──────────────────────────────────────────
export const useMLPredictions = () => useQuery({
  queryKey: ['ml', 'predictions'],
  queryFn: () => api.get('/api/ml/predictions').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLForecast = () => useQuery({
  queryKey: ['ml', 'forecast'],
  queryFn: () => api.get('/api/ml/forecast').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLSentiment = () => useQuery({
  queryKey: ['ml', 'sentiment'],
  queryFn: () => api.get('/api/ml/sentiment').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLAnomalies = () => useQuery({
  queryKey: ['ml', 'anomalies'],
  queryFn: () => api.get('/api/ml/anomalies').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLInsights = () => useQuery({
  queryKey: ['ml', 'insights'],
  queryFn: () => api.get('/api/ml/insights').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLScores = () => useQuery({
  queryKey: ['ml', 'scores'],
  queryFn: () => api.get('/api/ml/scores').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLExplain = (predictionType = 'productivity') => useQuery({
  queryKey: ['ml', 'explain', predictionType],
  queryFn: () => api.get('/api/ml/explain', { params: { prediction_type: predictionType } }).then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLConfidence = () => useQuery({
  queryKey: ['ml', 'confidence'],
  queryFn: () => api.get('/api/ml/confidence').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLEvaluate = () => useQuery({
  queryKey: ['ml', 'evaluate'],
  queryFn: () => api.get('/api/ml/evaluate').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLFeatureImportance = () => useQuery({
  queryKey: ['ml', 'feature-importance'],
  queryFn: () => api.get('/api/ml/feature-importance').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLRecommendations = () => useQuery({
  queryKey: ['ml', 'recommendations'],
  queryFn: () => api.get('/api/ml/recommendations').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLSimulation = () => useMutation({
  mutationFn: (data: any) => api.post('/api/ml/simulation', data).then(r => r.data),
})

export const useMLModelVersions = () => useQuery({
  queryKey: ['ml', 'model-version'],
  queryFn: () => api.get('/api/ml/model-version').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLSwitchVersion = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { version_tag: string }) => api.post('/api/ml/model-version', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ml'] })
      toast.success('Active model version updated!')
    }
  })
}

export const useMLRisk = () => useQuery({
  queryKey: ['ml', 'risk'],
  queryFn: () => api.get('/api/ml/risk').then(r => r.data),
  refetchOnWindowFocus: false,
})

export const useMLRetrain = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/ml/retrain').then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['ml'] })
      toast.success(`Retraining complete! Saved version: ${data.version_tag}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Retraining failed')
    }
  })
}


