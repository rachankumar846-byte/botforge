import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BotForge — Multi-tenant AI SaaS Chatbot Platform',
  description: 'Build and deploy AI chatbots for your business with RAG knowledge base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}