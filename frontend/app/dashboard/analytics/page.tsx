'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsData {
  totalMessages: number
  totalConversations: number
  totalBots: number
  mostActiveBot: string | null
  last7Days: { day: string; messages: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    const res = await fetch('http://localhost:5000/api/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  const maxMessages = data ? Math.max(...data.last7Days.map(d => d.messages), 1) : 1

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">← Back</button>
          <h1 className="text-2xl font-bold text-purple-400">Analytics</h1>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : data && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-center">
                <p className="text-3xl font-bold text-purple-400">{data.totalMessages}</p>
                <p className="text-gray-400 text-sm mt-1">Total Messages</p>
              </div>
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-center">
                <p className="text-3xl font-bold text-purple-400">{data.totalConversations}</p>
                <p className="text-gray-400 text-sm mt-1">Conversations</p>
              </div>
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-center">
                <p className="text-3xl font-bold text-purple-400">{data.totalBots}</p>
                <p className="text-gray-400 text-sm mt-1">Active Bots</p>
              </div>
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-center">
                <p className="text-xl font-bold text-purple-400 truncate">{data.mostActiveBot || 'N/A'}</p>
                <p className="text-gray-400 text-sm mt-1">Top Bot</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-6">Messages — Last 7 Days</h2>
              <div className="flex items-end gap-3 h-48">
                {data.last7Days.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2">
                    <span className="text-xs text-gray-400">{d.messages}</span>
                    <div
                      className="w-full bg-purple-600 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${(d.messages / maxMessages) * 160}px`,
                        minHeight: d.messages > 0 ? '8px' : '2px',
                        opacity: d.messages > 0 ? 1 : 0.2
                      }}
                    />
                    <span className="text-xs text-gray-500 text-center">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mt-4">
              <h2 className="text-lg font-semibold mb-4">Insights</h2>
              {data.totalMessages === 0 ? (
                <p className="text-gray-400 text-sm">No conversations yet. Share your bot widget to start getting data!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-gray-300 text-sm">
                    Your bots have handled <span className="text-purple-400 font-semibold">{data.totalMessages}</span> messages across <span className="text-purple-400 font-semibold">{data.totalConversations}</span> conversations.
                  </p>
                  {data.mostActiveBot && (
                    <p className="text-gray-300 text-sm">
                      Your most active bot is <span className="text-purple-400 font-semibold">"{data.mostActiveBot}"</span>.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}