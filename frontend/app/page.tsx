import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-5xl font-bold text-purple-400">BotForge</h1>
<p className="text-gray-400 text-xl text-center max-w-lg">
  Build, customize and deploy AI chatbots for your business in minutes
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