import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface VoiceNote {
  _id: string
  transcript: string
  duration: number
  processed: boolean
  taskId: string | null
  createdAt: string
}

type RecordState = 'idle' | 'recording' | 'done'

export default function VoiceCapture() {
  const [state, setState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedNoteId, setRecordedNoteId] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await api.get('/voice')
      if (res.data.success) setNotes(res.data.data)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load voice notes')
    } finally {
      setLoading(false)
    }
  }

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.')
    }
  }

  const stopRecord = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setState('done')

      // Wait a bit for onstop to fire, then upload
      setTimeout(async () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          await uploadAudio(blob, seconds)
        }
      }, 500)
    }
  }

  const uploadAudio = async (blob: Blob, duration: number) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', blob, 'recording.webm')
    formData.append('duration', String(duration))
    try {
      const res = await api.post('/voice/record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        setRecordedNoteId(res.data.data._id)
        setSuccess('Voice note saved!')
        fetchNotes()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('duration', '0')
    try {
      const res = await api.post('/voice/record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        setSuccess('Audio uploaded and transcribed!')
        fetchNotes()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateTask = async (noteId: string) => {
    try {
      const res = await api.post(`/voice/${noteId}/create-task`)
      if (res.data.success) {
        setSuccess('Task created from voice note!')
        fetchNotes()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create task')
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this voice note?')) return
    try {
      const res = await api.delete(`/voice/${noteId}`)
      if (res.data.success) {
        setSuccess('Voice note deleted')
        fetchNotes()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete')
    }
  }

  const reset = () => {
    setState('idle')
    setSeconds(0)
    setRecordedBlob(null)
    setRecordedNoteId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Voice Capture" subtitle="Speak your tasks" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Record card */}
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {/* Mic button */}
            <div className="relative mb-4">
              {state === 'recording' && (
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
              )}
              <button
                onClick={state === 'idle' ? startRecord : state === 'recording' ? stopRecord : reset}
                disabled={uploading}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50
                  ${state === 'recording'
                    ? 'bg-red-500 shadow-red-500/30'
                    : state === 'done'
                    ? 'bg-green-500 shadow-green-500/30'
                    : 'bg-primary-500 shadow-primary-500/30'
                  }`}
              >
                {state === 'recording' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : state === 'done' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8"  y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
              {state === 'idle'      ? 'Tap to record'   :
               state === 'recording' ? 'Recording…'      :
               'Recording saved!'}
            </p>

            {state === 'recording' && (
              <p className="text-2xl font-mono font-bold text-red-500 mt-1">
                {Math.floor(seconds / 60).toString().padStart(2,'0')}:{(seconds % 60).toString().padStart(2,'0')}
              </p>
            )}

            {uploading && (
              <div className="flex items-center gap-2 mt-3">
                <Spinner size="sm" />
                <span className="text-xs text-slate-500 dark:text-gray-400">Uploading…</span>
              </div>
            )}

            {state === 'done' && recordedNoteId && (
              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => handleCreateTask(recordedNoteId)}
                  className="flex-1 bg-primary-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-600 active:scale-95 transition-all"
                >
                  Save as Task
                </button>
                <button
                  onClick={reset}
                  className="px-4 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
                >
                  Redo
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Upload option */}
        <button
          onClick={() => uploadRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 border border-dashed border-slate-300 dark:border-gray-700
            rounded-2xl px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors active:scale-[0.99] disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
            📁
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Upload Audio File</p>
            <p className="text-xs text-slate-400 dark:text-gray-500">MP3, M4A, WAV supported</p>
          </div>
          <svg className="w-4 h-4 text-slate-300 dark:text-gray-600 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {/* How it works */}
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">How it works</p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Tap the mic and speak your note or task' },
              { step: '2', text: 'AI transcribes and extracts key info' },
              { step: '3', text: 'It lands in your Life Inbox automatically' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{s.step}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent voice notes */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
            Recent Notes
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : notes.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-4xl mb-2">🎤</p>
              <p className="text-sm text-slate-400 dark:text-gray-500">No voice notes yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {notes.map(n => (
                <Card key={n._id} className="p-3.5">
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary-500 dark:text-primary-400" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-gray-200 font-medium leading-snug line-clamp-1">
                        {n.transcript || '(No transcript)'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString()} · {Math.floor(n.duration / 60)}:{(n.duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!n.taskId && (
                        <button
                          onClick={() => handleCreateTask(n._id)}
                          className="text-[10px] font-semibold bg-primary-500 text-white px-2 py-1 rounded-full hover:bg-primary-600 transition-colors"
                        >
                          Task
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}
    </div>
  )
}
