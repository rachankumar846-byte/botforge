'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.companyName) {
      setError('All fields are required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Create Account</h2>
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Your name"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <input
            placeholder="Company name"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
            value={form.companyName}
            onChange={e => setForm({...form, companyName: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 ring-purple-500"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg font-semibold"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-gray-400 text-center">
          Have an account? <Link href="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}