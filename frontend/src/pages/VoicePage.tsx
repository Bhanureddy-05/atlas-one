import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, Play, Square, Search, Sparkles, MessageSquare, Award, Clock, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function VoicePage() {
  const navigate = useNavigate()

  // Voice Assistant state
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [commandFeedback, setCommandFeedback] = useState('')
  const recognitionRef = useRef<any>(null)

  // Voice Journal state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [journalTranscript, setJournalTranscript] = useState('')
  const [journals, setJournals] = useState<any[]>([])
  const [journalsLoading, setJournalsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Fetch Voice Journals
  const fetchJournals = async () => {
    try {
      const res = await api.get('/api/voice-journal/')
      setJournals(res.data)
      setJournalsLoading(false)
    } catch (e) {
      setJournalsLoading(false)
    }
  }

  useEffect(() => {
    fetchJournals()

    // Initialize Web Speech API Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript
        setSpokenText(resultText)
        handleVoiceCommand(resultText)
      }

      rec.onerror = () => {
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  // Speech Synthesis
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error('Text-to-speech not supported in this browser')
    }
  }

  // Voice Commands Handler
  const handleVoiceCommand = (command: string) => {
    const cleanCommand = command.toLowerCase().trim()
    setCommandFeedback(`Recognized command: "${command}"`)

    if (cleanCommand.includes('dashboard') || cleanCommand.includes('home')) {
      speakText('Navigating to your dashboard')
      setTimeout(() => navigate('/'), 1200)
    } else if (cleanCommand.includes('habit')) {
      speakText('Opening habits tracker')
      setTimeout(() => navigate('/habits'), 1200)
    } else if (cleanCommand.includes('planner') || cleanCommand.includes('tasks')) {
      speakText('Navigating to daily planner')
      setTimeout(() => navigate('/planner'), 1200)
    } else if (cleanCommand.includes('study') || cleanCommand.includes('data science')) {
      speakText('Navigating to data science study tracker')
      setTimeout(() => navigate('/study'), 1200)
    } else if (cleanCommand.includes('dsa') || cleanCommand.includes('leetcode')) {
      speakText('Opening DSA preparation vault')
      setTimeout(() => navigate('/dsa'), 1200)
    } else if (cleanCommand.includes('fitness') || cleanCommand.includes('workout')) {
      speakText('Opening your fitness split')
      setTimeout(() => navigate('/fitness'), 1200)
    } else if (cleanCommand.includes('diet') || cleanCommand.includes('calories')) {
      speakText('Opening diet logger')
      setTimeout(() => navigate('/diet'), 1200)
    } else if (cleanCommand.includes('briefing') || cleanCommand.includes('morning')) {
      triggerMorningBriefing()
    } else if (cleanCommand.includes('evening') || cleanCommand.includes('review')) {
      triggerEveningReview()
    } else {
      speakText(`Command not recognized: ${command}. Try say go to dashboard or read daily briefing.`)
    }
  }

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setSpokenText('')
      setCommandFeedback('Listening for command...')
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  // Briefing trigger
  const triggerMorningBriefing = async () => {
    setCommandFeedback('Compiling daily briefing...')
    try {
      const res = await api.get('/api/coach/insights')
      const strengths = res.data.strengths?.join('. ') || 'You are doing great'
      const tip = res.data.daily_tip || 'Focus on consistency today.'
      const text = `Good morning Bhanu! Welcome to your daily briefing. ${strengths}. Daily coaching advice: ${tip}`
      speakText(text)
      setCommandFeedback('Daily briefing read successfully.')
    } catch (e) {
      speakText('Good morning! Maintain your habits and stay consistent today.')
    }
  }

  const triggerEveningReview = () => {
    setCommandFeedback('Generating evening review...')
    const text = 'Good evening Bhanu! Let us review today\'s wins. You maintained your early morning wake schedule, solved your LeetCode goals, and balanced your daily diet target. Missed opportunities: water intake is slightly below average. Get some sleep by 10 PM.'
    speakText(text)
    setCommandFeedback('Evening review read successfully.')
  }

  // Audio Recording (Voice Journal)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
      }

      // Also trigger transcription speech recognition on-the-fly for offline transcript!
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const trRec = new SpeechRecognition()
        trRec.continuous = true
        trRec.interimResults = false
        trRec.lang = 'en-US'
        trRec.onresult = (event: any) => {
          let currentText = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentText += event.results[i][0].transcript + ' '
          }
          setJournalTranscript(prev => prev + currentText)
        }
        trRec.start()
        
        // Save recognition stop
        mediaRecorder.addEventListener('stop', () => {
          trRec.stop()
        })
      }

      setJournalTranscript('')
      mediaRecorder.start()
      setIsRecording(true)
      toast.success('🎙️ Recording voice journal entry...')
    } catch (err) {
      toast.error('Microphone access denied or not supported')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Audio captured. Ready to index!')
    }
  }

  const handleSaveVoiceJournal = async () => {
    if (!journalTranscript.trim()) {
      toast.error('No transcription text found. Please record or enter text.')
      return
    }

    const formData = new FormData()
    formData.append('transcript', journalTranscript)
    formData.append('date_str', new Date().toISOString().slice(0, 10))
    if (audioBlob) {
      formData.append('file', audioBlob, 'journal_record.webm')
    }

    const toastId = toast.loading('Saving voice journal...')
    try {
      await api.post('/api/voice-journal/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('🎙️ Voice Journal saved! +15 XP', { id: toastId })
      setJournalTranscript('')
      setAudioBlob(null)
      fetchJournals()
    } catch (e) {
      toast.error('Failed to save voice journal', { id: toastId })
    }
  }

  // Filter journals
  const filteredJournals = journals.filter(j => 
    j.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.mood && j.mood.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🎙️ AI Voice Center</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Control Atlas One with voice commands, record transcripted voice diaries, and listen to morning AI briefings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Voice Assistant & Recorder */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* AI Voice Assistant Card */}
          <div className="glass-card" style={{ padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Sparkles size={20} color="#818cf8" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>AI Voice Assistant</h3>
            </div>

            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
              Click mic and say "go to dashboard", "go to fitness", "read daily briefing", or "read evening review".
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <motion.button
                onClick={toggleSpeechRecognition}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: isListening ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.4)' : '0 4px 12px rgba(99,102,241,0.3)'
                }}
              >
                {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              </motion.button>
            </div>

            {commandFeedback && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 8, fontSize: 12, color: '#818cf8', display: 'inline-block', maxWidth: '100%' }}>
                {commandFeedback}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn-secondary" onClick={triggerMorningBriefing} style={{ fontSize: 12, gap: 4 }}>
                <Volume2 size={13} /> Read Briefing
              </button>
              <button className="btn-secondary" onClick={triggerEveningReview} style={{ fontSize: 12, gap: 4 }}>
                <Volume2 size={13} /> Evening Review
              </button>
            </div>
          </div>

          {/* Voice Journal Recorder Card */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Record Voice Journal</h3>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              {!isRecording ? (
                <button className="btn-primary" onClick={startRecording} style={{ gap: 6, width: '100%', justifyContent: 'center' }}>
                  <Mic size={15} /> Start Recording
                </button>
              ) : (
                <button className="btn-danger" onClick={stopRecording} style={{ gap: 6, width: '100%', justifyContent: 'center' }}>
                  <Square size={15} /> Stop Recording
                </button>
              )}
            </div>

            {journalTranscript && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Transcribed Text</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={journalTranscript}
                  onChange={e => setJournalTranscript(e.target.value)}
                />
              </div>
            )}

            {journalTranscript && (
              <button className="btn-primary" onClick={handleSaveVoiceJournal} style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                Save Audio & Transcription <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Voice Journal Logs Vault */}
        <div className="glass-card" style={{ padding: 24, minHeight: 520 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={18} color="#06b6d4" /> Voice Journal Vault
            </h3>
            
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px', width: 200 }}>
              <Search size={14} color="#64748b" />
              <input
                placeholder="Search transcripts..."
                style={{ background: 'none', border: 'none', color: '#f1f5f9', outline: 'none', fontSize: 12, width: '100%' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {journalsLoading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 100 }} />
              <div className="skeleton" style={{ height: 100 }} />
            </div>
          ) : filteredJournals.length > 0 ? (
            <div style={{ display: 'grid', gap: 16, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
              {filteredJournals.map((j) => (
                <div
                  key={j.id}
                  style={{
                    padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                      <Clock size={12} /> <span>{j.date}</span>
                    </div>
                    {j.mood && (
                      <span className="badge" style={{ fontSize: 11, background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        {j.mood}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.5, marginBottom: 12 }}>
                    "{j.transcript}"
                  </p>

                  {j.audio_path && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <audio controls src={j.audio_path} style={{ height: 32, width: '100%', borderRadius: 8, outline: 'none' }} />
                    </div>
                  )}

                  {j.ai_summary && (
                    <div style={{
                      marginTop: 10, backgroundColor: 'rgba(6,182,212,0.03)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#22d3ee',
                      display: 'flex', gap: 6, alignItems: 'center'
                    }}>
                      <Sparkles size={13} /> <span>{j.ai_summary}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>
              No voice journals indexed. Click record to capture your first daily voice log.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
