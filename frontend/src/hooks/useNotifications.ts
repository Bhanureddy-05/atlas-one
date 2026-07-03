import { useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export function useNotifications() {
  useEffect(() => {
    // Request notification permission if supported
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Set up water reminder (every 2 hours)
    const waterInterval = setInterval(() => {
      sendNotification('💧 Hydration Reminder', 'Time to drink a glass of water to keep your metabolism active!')
    }, 2 * 60 * 60 * 1000)

    // Set up daily checklist check (runs every 1 hour)
    const checkSchedule = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      
      // Study check at 4 PM
      if (hours === 16) {
        sendNotification('📚 Study Reminder', 'Have you logged your Data Science study or DSA practice today?')
      }
      
      // Workout check at 6 PM
      if (hours === 18) {
        sendNotification('💪 Workout Reminder', 'Time to hit your workout split today! Keep up your fitness progression.')
      }

      // Reading check at 9 PM
      if (hours === 21) {
        sendNotification('📖 Reading Reminder', 'Wind down your day with some reading. Aim to read at least 5 pages.')
      }

      // Sleep check at 9:30 PM
      if (hours === 21 && now.getMinutes() >= 30) {
        sendNotification('🌙 Wind Down Reminder', 'It is past 9:30 PM. Shut down screens to prepare for sleep by 10 PM.')
      }
    }, 60 * 60 * 1000)

    return () => {
      clearInterval(waterInterval)
      clearInterval(checkSchedule)
    }
  }, [])
}

function sendNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg'
    })
  } else {
    // Fallback to React hot toast in the application
    toast(body, {
      icon: '🔔',
      duration: 6000
    })
  }
}
