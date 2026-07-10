# 📚 Chaptered

### Turn reading from a solo habit into a shared experience.

[![ELUSoC 2026](https://img.shields.io/badge/ELUSoC-2026-blueviolet?style=for-the-badge)](https://github.com/vanshika114/Ch.aptered)

**Chaptered** is an open-source, community-driven social reading platform designed for avid readers, book clubs, and anyone looking to turn reading from a solo habit into a shared experience. 

This repository is part of **ELUSoC 2026** (Extracurricular League of United Software Contributors).

**Open Source • Community Driven • Built in Public**

---

## 📖 Project Overview

### Who it's for:
- **Individual Readers** who want to track their library, log reading sessions, and see insights on their reading streaks.
- **Book Clubs & Reading Groups** looking to coordinate reading lists, vote on books, and hold synchronized discussion threads.
- **Active Communities** wanting to discuss chapters and books in real time.

### Key Features Planned:
- **Personal Reading Tracker:** Track completion percentage, log pages read, upload book PDFs, and view reading stats.
- **Social Book Clubs:** Create and join public/private book clubs with invite-based membership.
- **Real-Time Club Chats:** Dynamic chat channels using Socket.io to talk about specific books and chapters.
- **Collaborative Voting:** In-club voting system to choose the group's next read.
- **Reading Motivation:** Streaks, milestones, and community accountability challenges.

---

## 🛠️ Tech Stack

| Layer              | Technology                                          |
| ------------------ | ---------------------------------------------------- |
| **Frontend**       | React 19 + TypeScript + Vite                        |
| **Styling**        | Tailwind CSS 4                                       |
| **Routing**        | React Router 7                                       |
| **State**          | Zustand (persisted to localStorage)                  |
| **PDF Handling**   | pdf.js (page detection) + jsPDF (client-side compression) |
| **Backend**        | Node.js + Express 5 + TypeScript                     |
| **Database**       | MongoDB + Mongoose                                   |
| **Real-Time**      | Socket.io                                            |
| **Authentication** | JWT (JSON Web Tokens) *(planned)*                    |
| **Book Data**      | Google Books API (with mock fallback)                |

---

## 📂 Repository Structure

```
chaptered/
├── chaptered-web/      # Frontend application (React + TS + Vite + Tailwind CSS 4)
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components (AddBookModal, Shelf, etc.)
│   │   ├── pages/       # Page views (Landing page, Library dashboard)
│   │   ├── store/       # Zustand state management
│   │   └── lib/         # Utility libraries (PDF parser, helpers)
│   └── package.json
│
├── chaptered-api/      # Backend application (Node.js + Express + TypeScript + Socket.io)
│   ├── src/
│   │   └── index.ts     # Entry point containing REST endpoints & Socket.io server setup
│   └── package.json
│
├── CONTRIBUTING.md     # Contribution guidelines & workflows (ELUSoC'26)
├── README.md           # Project documentation
└── .gitignore          # Root Git ignore configuration
```

---

## 🌱 Getting Started (Running Locally)

Follow these steps to set up Chaptered on your local machine.

### 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (running locally or a MongoDB Atlas connection string)

---

### ⚙️ Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/vanshika114/Ch.aptered.git
cd Ch.aptered
```

#### 2. Set Up the Backend (API)
Navigate to the `chaptered-api` folder, install its dependencies, set up your local environment file, and start the development server:
```bash
cd chaptered-api
npm install
cp .env.example .env   # Copy the template and fill in your values (like PORT, MONGODB_URI)
npm run dev            # Starts the API server on http://localhost:3000
```

#### 3. Set Up the Frontend (Web App)
In a new terminal window, navigate to the `chaptered-web` folder, install its dependencies, set up your local environment file, and start the Vite development server:
```bash
cd chaptered-web
npm install
cp .env.example .env   # Copy the template (optional, defaults are pre-configured)
npm run dev            # Starts the Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser to view the application!

---

## 🧪 Running Tests

You can run automated tests for both the frontend and backend locally.

### Frontend Tests (`chaptered-web`)

Frontend unit and component tests are built using **Vitest** and **React Testing Library**.

```bash
cd chaptered-web
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate a test coverage report
```

### Backend Tests (`chaptered-api`)

Backend API integration tests are built using **Jest** and **Supertest**.

```bash
cd chaptered-api
npm run test          # Run backend test suite
```

---

## 🤝 How You Can Contribute

We welcome and appreciate all contributions! Whether you want to fix a bug, suggest features, improve documentation, or write tests.

> 💡 **Please read our [Contributing Guidelines](CONTRIBUTING.md) first** to understand the getting assigned flow, branch naming rules, and PR requirements.

### 💻 Development Scope
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

---

## 📜 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it.

---

## ❤️ Built in Public

Chaptered is an experiment in building an open-source product from the ground up with the community involved from day one. Every discussion, feature decision, pull request, and contribution helps write the next chapter.

---

## 👩‍💻 Maintainer

**Vanshika Sharma**
Building Chaptered in public and always open to collaboration.
