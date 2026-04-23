import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-6xl font-bold text-purple-400 mb-4">BotForge</h1>
<p className="text-gray-400 text-xl max-w-lg mx-auto">
  Multi-tenant AI SaaS Chatbot Platform — upload docs, create bots, embed anywhere
</p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
          Login
        </Link>
        <Link href="/register" className="border border-purple-600 hover:bg-purple-900 px-6 py-3 rounded-lg font-semibold">
          Register
        </Link>
      </div>
    </div>
  )
}