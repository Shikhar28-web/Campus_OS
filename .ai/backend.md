You are building the backend for CampusOS, an AI-powered student operating system.
The frontend already exists at /frontend (React 18 + TypeScript + Vite + Tailwind CSS).

Read all frontend source files first before writing any backend code:
- frontend/src/App.tsx
- frontend/src/pages/Dashboard.tsx
- frontend/src/pages/LifeInbox.tsx
- frontend/src/pages/FocusEngine.tsx
- frontend/src/pages/AcademicPulse.tsx
- frontend/src/pages/VoiceCapture.tsx
- frontend/src/pages/TaskDetails.tsx
- frontend/src/data/mock.ts
- frontend/src/components/Header.tsx
- frontend/src/components/Card.tsx

─────────────────────────────────────────
REPO STRUCTURE TO CREATE
─────────────────────────────────────────

CampusOS/
├── frontend/          ← already exists, do not modify structure
└── backend/
    ├── src/
    │   ├── index.ts               ← Express app entry
    │   ├── config/
    │   │   └── db.ts              ← MongoDB connection
    │   ├── middleware/
    │   │   ├── auth.ts            ← JWT verify middleware
    │   │   ├── errorHandler.ts
    │   │   └── upload.ts          ← multer config
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Task.ts
    │   │   ├── InboxItem.ts
    │   │   └── VoiceNote.ts
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── tasks.ts
    │   │   ├── inbox.ts
    │   │   ├── focus.ts
    │   │   ├── pulse.ts
    │   │   └── voice.ts
    │   ├── controllers/
    │   │   ├── authController.ts
    │   │   ├── taskController.ts
    │   │   ├── inboxController.ts
    │   │   ├── focusController.ts
    │   │   ├── pulseController.ts
    │   │   └── voiceController.ts
    │   └── services/
    │       ├── aiService.ts       ← OpenAI integration
    │       └── ocrService.ts      ← image/PDF text extraction
    ├── .env.example
    ├── package.json
    └── tsconfig.json

─────────────────────────────────────────
TECH STACK — BACKEND
─────────────────────────────────────────

- Runtime:     Node.js 20+
- Framework:   Express 4 + TypeScript
- Database:    MongoDB with Mongoose
- Auth:        JWT (jsonwebtoken) + bcryptjs
- File upload: Multer (multipart/form-data)
- AI:          OpenAI API (gpt-4o-mini for text, whisper-1 for audio)
- OCR:         Tesseract.js (for screenshot text extraction)
- PDF parse:   pdf-parse
- CORS:        cors package (allow http://localhost:5173)
- Validation:  zod
- Dev:         ts-node-dev, dotenv

─────────────────────────────────────────
ENVIRONMENT VARIABLES (.env.example)
─────────────────────────────────────────

PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusos
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_key_here
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10

─────────────────────────────────────────
DATABASE MODELS (Mongoose + TypeScript)
─────────────────────────────────────────

User:
  - _id, email (unique), passwordHash, name
  - createdAt, updatedAt

Task:
  - _id, userId (ref User)
  - title, subject, deadline (Date), priority (High|Medium|Low)
  - status (pending|in_progress|completed)
  - source (manual|screenshot|pdf|voice)
  - sourceText (raw extracted text)
  - aiSummary (string)
  - steps: [{ label: string, done: boolean }]
  - createdAt, updatedAt

InboxItem:
  - _id, userId (ref User)
  - kind (Screenshot|PDF|Voice|Manual)
  - status (New|Processed|Archived)
  - originalText (raw OCR/transcript)
  - extracted (AI-cleaned summary string)
  - taskId (ref Task, optional — set after AI extracts a task)
  - fileUrl (string, optional)
  - createdAt

VoiceNote:
  - _id, userId (ref User)
  - transcript (string)
  - duration (number, seconds)
  - fileUrl (string)
  - processed (boolean)
  - taskId (ref Task, optional)
  - createdAt

─────────────────────────────────────────
API ROUTES — implement all of these
─────────────────────────────────────────

AUTH
  POST   /api/auth/register     { name, email, password } → { token, user }
  POST   /api/auth/login        { email, password }        → { token, user }
  GET    /api/auth/me           (auth required)            → user object

TASKS (all routes require auth)
  GET    /api/tasks             → all tasks for user (query: status, priority, subject)
  POST   /api/tasks             { title, subject, deadline, priority, source } → task
  GET    /api/tasks/:id         → single task
  PATCH  /api/tasks/:id         { title?, deadline?, priority?, status? } → updated task
  DELETE /api/tasks/:id         → { success: true }
  PATCH  /api/tasks/:id/step/:stepIndex  { done: boolean } → updated task (toggle step)

INBOX (all routes require auth)
  GET    /api/inbox             → all inbox items (query: status)
  POST   /api/inbox/screenshot  multipart: file (image) → InboxItem (runs OCR + AI extract)
  POST   /api/inbox/pdf         multipart: file (pdf)   → InboxItem (runs pdf-parse + AI extract)
  POST   /api/inbox/manual      { text } → InboxItem (runs AI extract)
  PATCH  /api/inbox/:id/archive → mark item Archived
  POST   /api/inbox/:id/create-task → creates Task from InboxItem, links taskId

FOCUS (requires auth)
  GET    /api/focus/recommend   → { task, reason, schedule }
        Logic: find highest priority pending task, use OpenAI to explain why
               and generate a schedule array: [{ time, label, duration }]

PULSE (requires auth)
  GET    /api/pulse             → {
          overallScore: number,
          subjects: [{ name, score, pendingAssignments }],
          upcoming: [{ title, date, days, type }],
          weeklyActivity: number[7],
          riskLevel: "Low"|"Medium"|"High"
        }
        Logic: calculate score from tasks (overdue = -10, completed = +5, etc.)

VOICE (requires auth)
  GET    /api/voice             → all voice notes for user
  POST   /api/voice/record      multipart: file (audio mp3/m4a/wav)
                                → sends to OpenAI Whisper, saves transcript, returns VoiceNote
  POST   /api/voice/:id/create-task → creates Task from transcript, links taskId
  DELETE /api/voice/:id         → { success: true }

─────────────────────────────────────────
AI SERVICE (src/services/aiService.ts)
─────────────────────────────────────────

Implement these functions using OpenAI gpt-4o-mini:

1. extractTaskFromText(rawText: string): Promise<{
     title: string
     subject: string
     deadline: string | null   // ISO date or null
     priority: "High"|"Medium"|"Low"
   }>
   System prompt: "You are an AI that extracts academic tasks from raw text.
   Return a JSON object with keys: title, subject, deadline (ISO string or null), priority."

2. generateFocusRecommendation(tasks: Task[]): Promise<{
     taskId: string
     reason: string
     schedule: { time: string; label: string; duration: string }[]
   }>
   System prompt: "You are an AI study coach. Given these pending tasks, recommend
   the most important one to focus on now and return JSON with:
   taskId, reason, schedule (array of {time, label, duration})."

3. transcribeAudio(filePath: string): Promise<string>
   Use OpenAI Whisper API (audio.transcriptions.create).

─────────────────────────────────────────
OCR SERVICE (src/services/ocrService.ts)
─────────────────────────────────────────

extractTextFromImage(filePath: string): Promise<string>
  Use Tesseract.js worker to extract text from uploaded image file.

extractTextFromPDF(filePath: string): Promise<string>
  Use pdf-parse to extract text from PDF buffer.

─────────────────────────────────────────
FRONTEND INTEGRATION
─────────────────────────────────────────

After building the backend, update the frontend as follows:

1. Create frontend/src/lib/api.ts
   - Base URL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
   - Export an axios instance with:
     * Authorization: Bearer <token from localStorage>
     * Request interceptor: attach token
     * Response interceptor: on 401 redirect to login screen

2. Create frontend/src/lib/auth.ts
   - saveToken(token), getToken(), clearToken() using localStorage
   - isLoggedIn(): boolean

3. Create frontend/src/context/AuthContext.tsx
   - Provides: user, login(email, password), register(name, email, password), logout
   - On mount: if token exists, call GET /api/auth/me to restore session
   - Wrap App in <AuthProvider>

4. Add a Login/Register screen
   - If user is not authenticated, show AuthScreen (email + password form, toggle register)
   - On success store token, set user, navigate to dashboard

5. Replace all hardcoded mock data in every page with real API calls:

   Dashboard.tsx:
     - useEffect → GET /api/tasks?status=pending&limit=3 (urgent tasks)
     - GET /api/pulse (score, riskLevel, weeklyStats)

   LifeInbox.tsx:
     - useEffect → GET /api/inbox
     - "Scan Screenshot" button → POST /api/inbox/screenshot (file input)
     - "Upload PDF" button     → POST /api/inbox/pdf (file input)
     - "Add Manually" button   → prompt text → POST /api/inbox/manual
     - "Create Task" button on item → POST /api/inbox/:id/create-task
     - Filter tabs work against live data

   FocusEngine.tsx:
     - useEffect → GET /api/focus/recommend (recommended task + schedule)
     - Task switcher → GET /api/tasks?status=pending
     - Timer is local state only (no API needed)

   AcademicPulse.tsx:
     - useEffect → GET /api/pulse
     - Render live subject scores, deadlines, weekly bar chart

   VoiceCapture.tsx:
     - "Stop" → POST /api/voice/record (send recorded blob as FormData)
     - "Upload" → file input → POST /api/voice/record
     - "Save as Task" → POST /api/voice/:id/create-task
     - Recent notes → GET /api/voice

   TaskDetails.tsx:
     - Receive taskId prop from Dashboard/Inbox navigation
     - useEffect → GET /api/tasks/:id
     - Step checkboxes → PATCH /api/tasks/:id/step/:stepIndex

6. Add a loading spinner component (frontend/src/components/Spinner.tsx)
   and error toast (frontend/src/components/Toast.tsx)
   Use them in every API call (loading state + error state).

7. Add VITE_API_URL to frontend/.env.local:
   VITE_API_URL=http://localhost:5000/api

─────────────────────────────────────────
BACKEND package.json scripts
─────────────────────────────────────────

"dev":   "ts-node-dev --respawn --transpile-only src/index.ts"
"build": "tsc"
"start": "node dist/index.js"

─────────────────────────────────────────
IMPORTANT IMPLEMENTATION RULES
─────────────────────────────────────────

1. Use TypeScript throughout — no `any` types, define interfaces for all request bodies and responses.
2. All routes must return consistent JSON: { success: true, data: ... } or { success: false, error: "message" }
3. All passwords hashed with bcryptjs (rounds: 12) before saving.
4. JWT payload: { userId, email }. Verify in auth middleware, attach req.user.
5. File uploads: save to backend/uploads/ folder, store relative path in DB.
6. Handle all async errors with try/catch and pass to errorHandler middleware.
7. The AI calls are optional graceful degradation — if OPENAI_API_KEY is missing, return sensible defaults so the app still works without an API key.
8. Run npm install in both /backend and /frontend after scaffolding.
9. After completing the backend, verify it starts without errors: npm run dev in /backend.
10. After updating the frontend, verify it compiles without TypeScript errors.
11. Do NOT break any existing UI — all visual design from the previous session must remain intact.
12. Add a backend/README.md with: setup steps, all env vars explained, how to run dev + prod.
