'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Bot {
  id: string
  name: string
  systemPrompt: string
  widgetColor: string
  isActive: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  const [newBotName, setNewBotName] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingBot, setEditingBot] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', systemPrompt: '' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetchBots()
  }, [])

  async function fetchBots() {
    const res = await fetch('http://localhost:5000/api/bots', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setBots(data)
    setLoading(false)
  }

  async function createBot() {
    if (!newBotName.trim()) return
    const res = await fetch('http://localhost:5000/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newBotName })
    })
    const bot = await res.json()
    setBots([...bots, bot])
    setNewBotName('')
  }

  async function saveBot(botId: string) {
    const res = await fetch(`http://localhost:5000/api/bots/${botId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm)
    })
    const updated = await res.json()
    setBots(bots.map(b => b.id === botId ? updated : b))
    setEditingBot(null)
  }

  function logout() {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">BotForge Dashboard</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              📊 Analytics
            </button>
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Create bot */}
        <div className="flex gap-3 mb-8">
          <input
            placeholder="Bot name..."
            className="bg-gray-900 p-3 rounded-lg flex-1 outline-none focus:ring-2 ring-purple-500"
            value={newBotName}
            onChange={e => setNewBotName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createBot()}
          />
          <button onClick={createBot} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Create Bot
          </button>
        </div>

        {/* Bot list */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : bots.length === 0 ? (
          <p className="text-gray-400">No bots yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map(bot => (
              <div key={bot.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-purple-500 transition-colors">

                {/* Bot header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bot.widgetColor }}/>
                    <h3 className="text-lg font-semibold">{bot.name}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBot(bot.id)
                      setEditForm({ name: bot.name, systemPrompt: bot.systemPrompt })
                    }}
                    className="text-gray-400 hover:text-white text-xs border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bot.systemPrompt}</p>

                {/* Widget script */}
                <div className="bg-gray-800 rounded-lg p-3 mb-3 flex items-center justify-between gap-2">
                  <code className="text-xs text-purple-300 truncate">
                    {`<script src="http://localhost:5000/widget/${bot.id}"></script>`}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<script src="http://localhost:5000/widget/${bot.id}"></script>`)
                      alert('Copied to clipboard!')
                    }}
                    className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
                    className="border border-purple-500 hover:bg-purple-900 px-4 py-2 rounded-lg text-sm font-semibold flex-1"
                  >
                    Knowledge Base
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/chat/${bot.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold flex-1"
                  >
                    Test Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBot && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-purple-400 mb-6">Edit Bot</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bot Name</label>
                <input
                  className="w-full bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">System Prompt</label>
                <textarea
                  className="w-full bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500 h-32 resize-none"
                  placeholder="You are a helpful assistant for..."
                  value={editForm.systemPrompt}
                  onChange={e => setEditForm({...editForm, systemPrompt: e.target.value})}
                />
                <p className="text-gray-500 text-xs mt-1">This defines how your bot behaves and responds.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingBot(null)}
                className="flex-1 border border-gray-600 hover:bg-gray-800 p-3 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => saveBot(editingBot)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 p-3 rounded-lg text-sm font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}