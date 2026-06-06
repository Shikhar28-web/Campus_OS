import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface InboxItem {
  _id: string
  kind: 'Screenshot' | 'PDF' | 'Voice' | 'Manual'
  status: 'New' | 'Processed' | 'Archived'
  extracted: string
  originalText: string
  taskId: string | null
  createdAt: string
}

const statusStyle: Record<string, string> = {
  New:       'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  Processed: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Archived:  'bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-500',
}

const kindEmoji: Record<string, string> = {
  Screenshot: '📸',
  PDF: '📄',
  Voice: '🎤',
  Manual: '✍️',
}

const TABS = ['All', 'New', 'Processed', 'Archived'] as const
type Tab = typeof TABS[number]

export default function LifeInbox() {
  const [tab, setTab] = useState<Tab>('All')
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const screenshotRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchInbox()
  }, [])

  const fetchInbox = async () => {
    try {
      const res = await api.get('/inbox')
      if (res.data.success) setItems(res.data.data)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load inbox')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'screenshot' | 'pdf') => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post(`/inbox/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        setSuccess('File uploaded and processed!')
        fetchInbox()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleManual = async () => {
    const text = prompt('Enter your task or note:')
    if (!text || !text.trim()) return
    try {
      const res = await api.post('/inbox/manual', { text })
      if (res.data.success) {
        setSuccess('Note added!')
        fetchInbox()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add note')
    }
  }

  const handleCreateTask = async (id: string) => {
    try {
      const res = await api.post(`/inbox/${id}/create-task`)
      if (res.data.success) {
        setSuccess('Task created!')
        fetchInbox()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create task')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const res = await api.patch(`/inbox/${id}/archive`)
      if (res.data.success) {
        setSuccess('Archived!')
        fetchInbox()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to archive')
    }
  }

  const filtered = tab === 'All' ? items : items.filter(i => i.status === tab)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Life Inbox" subtitle="Captured inputs" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Upload strip */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => screenshotRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-dashed border-slate-200 dark:border-gray-700
              rounded-2xl py-3 px-2 text-center active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 leading-tight">Scan Screenshot</span>
          </button>
          <button
            onClick={() => pdfRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-dashed border-slate-200 dark:border-gray-700
              rounded-2xl py-3 px-2 text-center active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">{uploading ? '⏳' : '📄'}</span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 leading-tight">Upload PDF</span>
          </button>
          <button
            onClick={handleManual}
            className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-dashed border-slate-200 dark:border-gray-700
              rounded-2xl py-3 px-2 text-center active:scale-95 transition-all"
          >
            <span className="text-2xl">✍️</span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 leading-tight">Add Manually</span>
          </button>
        </div>

        <input
          ref={screenshotRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'screenshot')}
        />
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
        />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all
                ${tab === t
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-700'
                }`}
            >
              {t}
              {t !== 'All' && (
                <span className="ml-1 opacity-70">{items.filter(i => i.status === t).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(item => (
              <Card key={item._id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                    {kindEmoji[item.kind] || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">
                        {item.extracted || item.originalText.slice(0, 100)}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                        {item.kind}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.status !== 'Archived' && !item.taskId && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleCreateTask(item._id)}
                          className="text-[10px] font-semibold bg-primary-500 text-white px-3 py-1 rounded-full hover:bg-primary-600 transition-colors"
                        >
                          Create Task
                        </button>
                        <button
                          onClick={() => handleArchive(item._id)}
                          className="text-[10px] font-semibold bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    )}
                    {item.taskId && (
                      <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-medium">✓ Task created</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-slate-400 dark:text-gray-500">Nothing here yet</p>
          </div>
        )}

      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}
    </div>
  )
}
