'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`session-${Date.now()}`)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botId: id, sessionId: sessionId.current, message: input })
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setError('No reply received')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">← Back</button>
        <h1 className="text-xl font-bold text-purple-400">Test Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-8">Send a message to start chatting</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl max-w-[80%] break-words ${
            msg.role === 'user'
              ? 'bg-purple-600 self-end'
              : 'bg-gray-800 self-start text-white'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-800 p-4 rounded-xl self-start text-gray-400 flex gap-2 items-center">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
          </div>
        )}
        {error && (
          <div className="bg-red-900 text-red-300 p-3 rounded-xl self-start text-sm">
            {error}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 bg-gray-900 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  )
}