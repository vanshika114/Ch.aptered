# 📚 Chaptered

### Turn reading from a solo habit into a shared experience.

A social reading platform where readers can track progress, join book clubs, discuss books in real time, and build meaningful reading habits together.

**Open Source • Community Driven • Built in Public**

---

## 🌟 Why Chaptered?

Reading has never been easier.

Finishing books consistently? Finding people to discuss them with? Staying motivated?

That's the hard part.

Most reading apps focus on tracking books. Most social platforms focus on conversations.

**Chaptered brings both together.**

Imagine logging your reading session, seeing your progress grow, discussing a chapter with friends in real time, voting on the next book for your club, and building lasting reading habits alongside a community.

We're building a place where books don't just sit on shelves.

They start conversations.

---

## 🚀 Current Status

### We're past Day Zero — the reading tracker MVP is live.

Chaptered started as an empty repo, but it's already grown into a working app:

- A polished **landing page** with the full product story
- A functional **Library** where you can add books, upload PDFs, log sessions, and track progress
- A small **Express API** that powers book search
- The scaffolding is in place for the social/club features that come next

Right now, data lives in your browser (`localStorage`) — there's no account system or shared database yet, so nothing syncs across devices or people. That's the next big milestone. See [What's Working Today](#-whats-working-today) and the [Roadmap](#️-roadmap) below for the honest breakdown.

Contributors still have a rare opportunity: the hard architectural decisions (auth, real-time sync, clubs) haven't been made yet, so your ideas can shape the direction of the project.

---

## ✅ What's Working Today

### 📖 Reading Tracker (`chaptered-web`)

- Add books manually, or search **Google Books** (via the API) and auto-fill title, author, page count, and description
- Upload a PDF per book — pages are auto-detected client-side (pdf.js), and oversized files are automatically compressed
- Read PDFs right in the browser through an in-app reader modal
- Edit or delete books at any time
- Log reading sessions (pages read + an optional note) per book
- Automatic per-book progress bars, reading streaks, and library-wide stats (total books, pages read, sessions, completed vs. in-progress vs. not-started)
- Search, genre filter, status filter, and grid/list views on your shelf
- Everything currently persists to `localStorage` via Zustand — it's yours locally, but it isn't synced anywhere yet (PDFs themselves are session-only and need re-uploading after a refresh)

### 🔌 API (`chaptered-api`)

- Express + TypeScript server with a health-check endpoint
- `/api/books/search` proxies the Google Books API (with a mock fallback if no API key is set or the request fails)
- Socket.IO server is initialized and ready for real-time features, though no chat/club events are wired up yet
- Mongoose is installed but not yet connected to a database — there's no persistence layer on the backend yet

### 🧭 Landing Page

- Full marketing/story page (hero, features, how-it-works, why reading matters, tech stack, roadmap) linking into the Library

---

## 💭 What We're Building Toward

Chaptered aims to combine:

### 📖 Reading Tracker

Track books, reading sessions, progress, and personal goals. *(Live — see above)*

### 📊 Reading Insights

Visualize reading habits, streaks, statistics, and long-term growth. *(Basic version live; deeper analytics planned)*

### 👥 Book Clubs

Create communities around books and read together. *(Not started)*

### 💬 Real-Time Discussions

Discuss chapters, share thoughts, and stay connected while reading. *(Socket.IO server scaffolded; no events implemented yet)*

### 🎯 Reading Motivation

Challenges, milestones, achievements, and community accountability. *(Not started)*

---

## 🗺️ Roadmap

### Phase 1 • MVP

- [x] Book Search (Google Books API)
- [x] Manual Book Entry
- [x] Reading Session Logging
- [x] Reading Streaks
- [x] Personal Dashboard
- [x] In-Browser PDF Reader *(bonus, not originally scoped)*
- [ ] User Authentication
- [ ] Persistent Storage (MongoDB, replacing localStorage)
- [ ] Book Clubs
- [ ] Invite-Based Club Joining
- [ ] Real-Time Club Chat (Socket.io)
- [ ] Club Book Voting

### Phase 2

- [ ] Premium Features
- [ ] AI Reading Coach
- [ ] Personalized Recommendations
- [ ] Advanced Reading Analytics

### Phase 3+

- [ ] Mobile App
- [ ] Video Book Club Meetings
- [ ] Reading Challenges
- [ ] Achievement Badges
- [ ] Push Notifications

---

## 🛠️ Tech Stack

| Layer              | Technology                                          |
| ------------------ | ---------------------------------------------------- |
| Frontend           | React 19 + TypeScript + Vite                        |
| Styling            | Tailwind CSS 4                                       |
| Routing            | React Router 7                                       |
| State Management   | Zustand (persisted to localStorage)                  |
| PDF Handling       | pdf.js (page detection) + jsPDF (client-side compression) |
| Backend            | Node.js + Express 5 + TypeScript                     |
| Database           | MongoDB + Mongoose *(installed, not yet connected)*  |
| Real-Time          | Socket.io *(server ready, no events yet)*            |
| Book Data          | Google Books API (with mock fallback)                |
| Deployment         | Vercel + Railway *(planned)*                         |

> Technology decisions are open for discussion. Strong opinions are welcome.

---

## 📂 Project Structure

```
chaptered/
├── chaptered-web/      # Frontend — React + TypeScript + Vite
│   ├── src/pages/       # Landing, Library
│   ├── src/components/  # AddBookModal, etc.
│   ├── src/store/       # Zustand store (books, sessions, PDF blobs)
│   └── src/lib/         # bookUtils, pdfUtils, storage helpers
├── chaptered-api/      # Backend — Express + TypeScript + Socket.io
│   └── src/index.ts     # Health check + Google Books search proxy
└── README.md
```

---

## 🌱 Getting Started (Running Locally)

### 1. Clone the repo

```bash
git clone https://github.com/vanshika114/Ch.aptered.git
cd Ch.aptered
```

### 2. Run the API

```bash
cd chaptered-api
npm install
cp .env.example .env   # optionally add a GOOGLE_BOOKS_API_KEY — search works without one via a mock fallback
npm run dev             # starts on http://localhost:3000
```

### 3. Run the web app

```bash
cd chaptered-web
npm install
npm run dev              # starts on http://localhost:5173
```

Open `http://localhost:5173` and head to **Library** to start adding books.

---

## 🤝 How You Can Contribute

There's a working foundation now, but plenty of the interesting work — auth, real persistence, clubs, real-time chat — hasn't been built yet.

### 💻 Development

- Wiring up MongoDB persistence (replacing localStorage)
- User authentication (JWT)
- Book Clubs + invite-based joining
- Real-time chat and presence (Socket.io)
- Club book voting
- Turning the mock/fallback search into a more robust book-data pipeline

### 🗄️ System Design

- Database schema design for users, books, clubs, and sessions
- API contracts between `chaptered-web` and `chaptered-api`
- Migration plan from localStorage to a real backend
- Scalability planning

### 🎨 Design

- Wireframes for Book Clubs and chat
- UI/UX refinements to the existing Library and Landing pages
- Design systems, branding ideas

### 📝 Community & Documentation

- Improve documentation
- Write onboarding guides
- Suggest features
- Participate in discussions

You don't need to be an expert. If you're excited about the idea and willing to contribute, you're welcome here.

---

## 📋 Contribution Principles

### Code Style

- TypeScript-first
- Small, focused functions
- Consistent project structure
- Readable code over clever code

### Commit Convention

```
feat: add reading streak tracker
fix: resolve authentication bug
docs: update setup guide
chore: configure eslint
```

---

## 🌱 Get Involved

### 1. Join the Conversation

Have ideas? Questions? Feedback? Open a Discussion and introduce yourself.

### 2. Explore Issues

Check existing issues or create a new one.

### 3. Claim an Issue

Comment on the issue you're interested in working on so everyone knows it's being handled.

### 4. Submit a Pull Request

Once your work is ready, open a PR and we'll review it together.

---

## 💡 Have an Idea?

Open a discussion. Seriously.

Some of the best features in open-source projects start as a random thought from a contributor.

---

## 📜 License

This project is licensed under the MIT License.

Feel free to use, modify, and distribute it.

---

## ❤️ Built in Public

Chaptered is an experiment in building an open-source product from the ground up with the community involved from day one.

Every discussion, feature decision, pull request, and contribution helps write the next chapter.

And we're just getting started.

---

## 👩‍💻 Maintainer

**Vanshika Sharma**

Building Chaptered in public and always open to collaboration.
