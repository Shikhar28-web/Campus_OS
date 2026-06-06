# 🎓 CampusOS — Your Student Operating System

> A mobile-first AI-powered productivity app built for students to manage tasks, focus sessions, academic performance, and voice notes — all in one place.

---

## 📱 Live Demo

| Access | URL |
|--------|-----|
| Local (PC) | http://localhost:5173 |
| Network (Mobile) | http://10.2.204.89:5173 |
| Backend API | http://localhost:5000 |

---

## ✨ Features

### 📊 Dashboard
- Academic Pulse score (0–100) with risk level indicator
- Quick action buttons for all features
- Urgent tasks list with priority badges
- AI-recommended focus task
- Stats strip (Due Soon, Completed, Overdue)

### 📥 Life Inbox
- Upload screenshots → AI extracts tasks via OCR (Tesseract.js)
- Upload PDFs → AI extracts text via pdf-parse
- Add manual notes
- Filter by status: All / New / Processed / Archived
- One-tap "Create Task" from any inbox item

### ⚡ Focus Engine
- Pomodoro timer (25 / 45 / 60 min sessions)
- AI-recommended task to focus on
- **Complete Task button** → marks task done + boosts Academic Pulse
- Smart recommendations ("Complete early to boost your Pulse!")
- Deadline urgency badges (overdue, due today, X days left)
- Suggested study schedule from AI
- Session completes with success notification

### 📈 Academic Pulse
- Overall score calculated from task completion
- Risk level: Low / Medium / High
- Subject-wise performance breakdown with progress bars
- Upcoming deadlines sorted by urgency
- Weekly activity chart

### 🎤 Voice Capture
- Record voice notes directly in the browser
- Upload audio files (MP3, M4A, WAV, WebM)
- AI transcription
- Create tasks from voice notes
- Recent notes history with delete option

### 📋 Task Details
- Full task breakdown with AI summary
- Step-by-step checklist with progress bar
- Toggle individual steps as done
- Deadline and source info
- "Start Focusing" direct navigation

### 🎨 UI / UX
- **Mobile-first** responsive design
- **Dark / Light theme** toggle
- Glassmorphism effects
- Smooth animations and transitions
- Bottom navigation with active states

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Styling |
| **Axios** | HTTP client for API calls |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Web server |
| **TypeScript** | Type safety |
| **OpenRouter AI** (GPT-4o-mini) | Task extraction, focus recommendations |
| **Tesseract.js** | OCR — extract text from screenshots |
| **pdf-parse** | Extract text from PDF files |
| **Multer** | File upload handling |
| **Zod** | Request validation |
| **tsx** | TypeScript execution with hot reload |

### Database
| Technology | Purpose |
|------------|---------|
| **In-memory Mock DB** | Instant demo — no setup needed |
| **Supabase** (optional) | PostgreSQL cloud database for production |

---

## 🗂 Project Structure

```
CampusOS/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx       # Sticky header with theme toggle
│   │   │   ├── Card.tsx         # Reusable card component
│   │   │   ├── Toast.tsx        # Notification toasts
│   │   │   └── Spinner.tsx      # Loading spinner
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Home screen
│   │   │   ├── LifeInbox.tsx    # Upload & process inputs
│   │   │   ├── FocusEngine.tsx  # Timer + complete task
│   │   │   ├── AcademicPulse.tsx# Performance analytics
│   │   │   ├── VoiceCapture.tsx # Voice notes
│   │   │   └── TaskDetails.tsx  # Task breakdown
│   │   ├── lib/
│   │   │   └── api.ts           # Axios instance (auto-detects IP for mobile)
│   │   ├── App.tsx              # Root with ThemeContext + NavContext
│   │   └── styles.css           # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── taskController.ts
│   │   │   ├── inboxController.ts
│   │   │   ├── focusController.ts
│   │   │   ├── pulseController.ts
│   │   │   └── voiceController.ts
│   │   ├── routes/
│   │   │   ├── tasks.ts
│   │   │   ├── inbox.ts
│   │   │   ├── focus.ts
│   │   │   ├── pulse.ts
│   │   │   └── voice.ts
│   │   ├── services/
│   │   │   ├── aiService.ts     # OpenRouter AI integration
│   │   │   └── ocrService.ts    # Tesseract + pdf-parse
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── upload.ts        # Multer config
│   │   ├── db/
│   │   │   └── mockDb.ts        # In-memory database with sample data
│   │   ├── config/
│   │   │   ├── config.ts
│   │   │   └── db.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts             # Express app entry
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── supabase-schema.sql      # SQL schema for production DB
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Shikhar28-web/Campus_OS.git
cd Campus_OS
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
Backend starts on → http://localhost:5000

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on → http://localhost:5173

### 4. Open in Browser
- **PC:** http://localhost:5173
- **Mobile:** Use your PC's network IP (shown in the terminal when Vite starts)

---

## 📡 API Reference

### Tasks
```
GET    /api/tasks              → List all tasks
GET    /api/tasks/:id          → Get task by ID
POST   /api/tasks              → Create new task
PATCH  /api/tasks/:id          → Update task (status, steps, etc.)
PATCH  /api/tasks/:id/step/:i  → Toggle a specific step
DELETE /api/tasks/:id          → Delete task
```

### Inbox
```
GET    /api/inbox              → List all inbox items
POST   /api/inbox/screenshot   → Upload screenshot (OCR)
POST   /api/inbox/pdf          → Upload PDF (text extraction)
POST   /api/inbox/manual       → Add manual note
POST   /api/inbox/:id/create-task → Create task from inbox item
PATCH  /api/inbox/:id/archive  → Archive item
```

### Voice
```
GET    /api/voice              → List voice notes
POST   /api/voice/record       → Upload audio recording
POST   /api/voice/:id/create-task → Create task from voice note
DELETE /api/voice/:id          → Delete voice note
```

### Focus & Pulse
```
GET    /api/focus/recommend    → AI-recommended task + schedule
GET    /api/pulse              → Academic analytics & score
GET    /api/health             → Health check
```

---

## 🌱 Sample Data

The app comes pre-loaded with 5 sample tasks:

| Task | Subject | Priority | Due |
|------|---------|----------|-----|
| Complete Physics Lab Report | Physics | 🔴 High | 3 days |
| Study for Math Midterm | Mathematics | 🔴 High | 7 days |
| Chemistry Problem Set | Chemistry | 🟡 Medium | 2 days |
| English Essay Draft | English | 🟡 Medium | 5 days |
| Prepare Presentation | History | 🟢 Low | 10 days |

---

## 🔧 Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development

# Supabase (for production)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_key
```

---

## 🗄 Production Database (Supabase)

To connect to a real database instead of the mock DB:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/supabase-schema.sql` in the Supabase SQL Editor
3. Update `backend/.env` with your credentials
4. Update `backend/src/controllers/*.ts` to use Supabase client from `src/config/db.ts`

---

## 📸 Screenshots

### Dashboard
- Academic Pulse score with gradient card
- Quick action grid
- Urgent tasks with priority badges

### Focus Engine
- Circular progress timer
- AI recommendation banner
- ✅ Complete Task button with Pulse boost indicator

### Academic Pulse
- Overall score
- Subject breakdown with animated progress bars
- Upcoming deadlines

---

## 🏆 Built For

This project was built as a **hackathon project** demonstrating how AI can make student life easier by:
- Auto-extracting tasks from photos and documents
- Recommending what to study next
- Tracking academic performance automatically
- Making task management effortless on mobile

---

## 👨‍💻 Author

**Shikhar** — [@Shikhar28-web](https://github.com/Shikhar28-web)

---

## 📄 License

MIT License — feel free to use and modify.
