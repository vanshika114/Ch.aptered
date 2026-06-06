# 📚 Chaptered

> **Turn reading from a solo habit into a shared experience.**

Chaptered is an open-source social reading platform — currently in the idea stage and being built from scratch. If you love reading and want to help build something meaningful, you're in the right place.

---

## 🌱 Project Status

**This project is at day zero.** No code has been written yet. We're laying the foundation — defining what we're building, how it'll work, and how contributors can get involved early.

This is a great time to join. You can shape the direction of the project, pick up foundational tasks, and grow alongside the codebase.

---

## 💡 The Idea

Most reading apps treat reading as a solo activity. Chaptered wants to change that.

The goal is a web app that combines:

- 📖 **Personal reading tracking** — log books, record sessions, build streaks
- 📊 **Reading insights** — see your habits, progress, and stats over time
- 👥 **Book clubs** — create or join clubs, read together, vote on next books
- 💬 **Real-time discussion** — chat with your club as you read

Less "books gathering dust." More "stories sparking conversations."

---

## 🗺️ Planned Features

These are the features we're planning to build, roughly in order.

### Phase 1 — MVP
- [ ] User authentication (sign up, log in, sessions)
- [ ] Book search via Google Books API + manual entry
- [ ] Reading session logging (pages read, time spent)
- [ ] Reading streaks and basic stats
- [ ] Personal dashboard
- [ ] Book clubs (create, join via invite code)
- [ ] Real-time club chat (Socket.io)
- [ ] Book voting within clubs

### Phase 2
- [ ] Premium tier (Stripe)
- [ ] AI reading coach
- [ ] Personalized book recommendations

### Phase 3+
- [ ] Mobile app (React Native)
- [ ] Video book club meetings
- [ ] Reading challenges and badges
- [ ] Push notifications

---

## 🛠️ Planned Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State management | Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Real-time | Socket.io |
| Deployment | Vercel (frontend), Railway (backend), MongoDB Atlas |

> These choices aren't locked in stone yet. If you have a strong opinion on any of them, open a discussion!

---

## 📁 Planned Project Structure

```
chaptered/
├── chaptered-web/     ← React frontend
├── chaptered-api/     ← Node.js backend
└── README.md
```

---

## 🤝 How to Get Involved

We're actively looking for contributors to help build Chaptered from the ground up.

### What we need right now

- **Project setup** — scaffolding the frontend and backend repos
- **Database schema design** — modeling users, books, clubs, sessions
- **API design** — defining the routes and contract between frontend and backend
- **UI/UX** — wireframes, component design, design system decisions
- **Discussions** — help shape features, tech decisions, and priorities

### To contribute

1. **Browse or open issues** — check what's being discussed or propose something new
2. **Join the conversation** — use GitHub Discussions for questions, ideas, and feedback
3. **Pick something up** — grab an open issue, comment that you're working on it, and go

No contribution is too small. Questions, suggestions, and opinions are just as valuable as code right now.

---

## 📋 Contribution Guidelines

*(To be expanded as the project grows)*

When we do start writing code, we'll follow these principles:

- Use TypeScript throughout
- Keep functions small and focused
- Follow the existing folder structure
- Write clear commit messages using conventional commits:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation
  - `chore:` — setup, config, tooling

---

## 🐛 Issues & Discussions

- **Have an idea?** → Open a [GitHub Discussion](https://github.com/vanshika114/Chaptered/discussions)
- **Found a problem or want to propose something specific?** → Open an [Issue](https://github.com/vanshika114/Chaptered/issues)
- **Not sure where to start?** → Say hi in Discussions — we'll help point you in the right direction

---

## 📜 License

MIT — free to use, modify, and distribute.

---

## 👩‍💻 Maintainer

**Vanshika Sharma** — open to collaborations and contributions. Building in public, one chapter at a time.
