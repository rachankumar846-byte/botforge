# BotForge — Multi-tenant AI SaaS Chatbot Platform

A production-ready multi-tenant SaaS where businesses create custom AI chatbots, upload documents for RAG-powered responses, and embed chatbots on any website via a script tag.

## Features
- 🤖 Multi-tenant architecture — each business gets isolated workspace
- 📄 RAG Knowledge Base — upload PDF, TXT, DOCX files
- 🔌 Embeddable Widget — one script tag to add chatbot to any website
- 📊 Analytics Dashboard — track messages and conversations
- 🔐 JWT Authentication — secure login and registration

## Tech Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM
- **AI:** Groq API (Llama 3.3 70B)
- **File Processing:** PDF, DOCX parsing

## Getting Started
### Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

### Frontend
cd frontend
npm install
npm run dev