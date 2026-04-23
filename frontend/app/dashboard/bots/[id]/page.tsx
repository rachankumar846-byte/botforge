'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Doc {
  id: string
  filename: string
  uploadedAt: string
}

export default function BotPage() {
  const { id } = useParams()
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    const res = await fetch(`http://localhost:5000/api/knowledge/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setDocs(data)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('botId', id as string)

    const res = await fetch('http://localhost:5000/api/knowledge/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await res.json()
    if (data.id) {
      setMessage('✅ File uploaded successfully!')
      fetchDocs()
    } else {
      setMessage('❌ Upload failed: ' + (data.error || 'Unknown error'))
    }
    setUploading(false)
  }

  async function deleteDoc(docId: string) {
    await fetch(`http://localhost:5000/api/knowledge/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setDocs(docs.filter(d => d.id !== docId))
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">← Back</button>
          <h1 className="text-2xl font-bold text-purple-400">Knowledge Base</h1>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <p className="text-gray-400 text-sm mb-4">Upload PDF, TXT or DOCX (Word) files. Your bot will use this to answer questions.</p>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-gray-400 text-sm">
              {uploading ? 'Uploading...' : 'Click to upload PDF, TXT or DOCX'}
            </span>
            <span className="text-gray-600 text-xs mt-1">Supports resumes, docs, notes</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {message && (
            <p className={`mt-3 text-sm text-center ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Uploaded Documents ({docs.length})</h2>

          {docs.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents yet. Upload your first file above.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {doc.filename.endsWith('.pdf') ? '📕' : doc.filename.endsWith('.docx') ? '📘' : '📄'}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{doc.filename}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-800 hover:border-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/dashboard/chat/${id}`)}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 p-3 rounded-xl font-semibold"
        >
          Test Chat with Knowledge Base →
        </button>
      </div>
    </div>
  )
}