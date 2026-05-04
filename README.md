📚 Chaptered

A social reading platform to track books, build habits, and connect through book clubs.

🚀 Live Demo: Coming Soon
📖 Docs: TECHNICAL_PLAN.md

🌟 What is Chaptered?

Chaptered is a full-stack web application designed to make reading more engaging, social, and consistent.

It combines:

📖 Personal reading tracking
👥 Book clubs & discussions
📊 Reading analytics

Built as a 7-day MVP, it showcases scalable architecture, real-time features, and modern dev practices using React, Node.js, and MongoDB.

🧩 Features
✅ Current (MVP - Phase 1)

🔐 Authentication

JWT-based login/signup
Secure password hashing
Persistent sessions

📖 Reading Tracker

Add books (manual + Google Books API)
Track reading sessions (pages + time)
Reading streaks & stats

📊 Dashboard

Active books overview
Weekly reading insights
Quick session logging

🔍 Book Discovery

Search via Google Books API
One-click add
Manual entry support

👥 Book Clubs

Create/join clubs
Invite via code
Track member progress

💬 Real-Time Chat

Socket.io powered messaging
Persistent history
Timestamps

🗳️ Book Voting

Suggest books
Vote within clubs
Auto-select winning book
🚧 Upcoming (Phase 2)
💳 Stripe-based premium tier
🤖 AI Reading Coach
🎯 Personalized recommendations
🧠 Spoiler-free discussions
🔮 Future Vision (Phase 3+)
📱 Mobile app (React Native)
📞 Video book club meetings
🔔 Push notifications
🏆 Reading challenges & badges
🛠️ Tech Stack
Frontend
React 18 + TypeScript
Vite
Tailwind CSS
Zustand
React Router
Axios
Socket.io Client
Backend
Node.js + Express
TypeScript
MongoDB + Mongoose
JWT Auth
Socket.io
DevOps
Vercel (Frontend)
Railway / Heroku (Backend)
MongoDB Atlas
📁 Project Structure
chaptered/
├── chaptered-web/    # React frontend
├── chaptered-api/    # Node.js backend
└── README.md
🚀 Getting Started
1. Clone Repo
git clone https://github.com/yourusername/chaptered.git
cd chaptered
2. Setup Frontend
cd chaptered-web
npm install
npm run dev
3. Setup Backend
cd chaptered-api
npm install
npm run dev
4. Environment Variables

Backend .env

PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173

Frontend .env.local

VITE_API_URL=http://localhost:5000/api
📡 API Overview
Method	Endpoint	Description
POST	/auth/signup	Register user
POST	/auth/login	Login
GET	/auth/me	Current user
GET	/books	Get books
POST	/books	Add book
POST	/books/:id/sessions	Log session

👉 Full API: TECHNICAL_PLAN.md

🔐 Authentication Flow
User logs in/signup
Backend returns JWT
Token stored in frontend
Sent via Authorization: Bearer <token>
Middleware verifies requests
🧪 Testing
Backend
curl http://localhost:5000/api/health
Frontend
Test signup/login
Verify dashboard loads
Check API calls in DevTools
🚀 Deployment
Frontend (Vercel)
Connect repo
Set VITE_API_URL
Deploy
Backend (Railway)
Add environment variables
Deploy via GitHub
🤝 Contributing

We welcome contributions!

Steps
git checkout -b feature/your-feature
git commit -m "feat: add new feature"
git push origin feature/your-feature

Then open a Pull Request 🚀

Contribution Guidelines
Use TypeScript
Follow existing structure
Keep functions small
Write clear commit messages
🐛 Issues & Support
Open an issue for bugs
Use discussions for ideas
Include reproduction steps
📊 Project Highlights
⚡ Built in 7 days
🧱 ~4500 lines of code
🔗 20+ API endpoints
🧠 Real-time features with Socket.io
🔒 Secure authentication system
📄 License

MIT License

👩‍💻 Maintainer

Vanshika Sharma
Open to collaborations and contributions!

💡 Why This Project Matters

Chaptered isn’t just a tracker. It’s trying to turn reading from a solo habit into a shared experience. Less “books gathering dust,” more “stories sparking conversations.”
