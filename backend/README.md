# CampusOS Backend

Express + TypeScript + Supabase + OpenRouter AI backend for CampusOS.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Supabase:**
   
   **IMPORTANT:** You must run the SQL schema first!
   
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/pihzhgklaxpgzfucqwbh)
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste the ENTIRE contents of `supabase-schema.sql`
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message
   
   After running the SQL, your database will have:
   - ✅ tasks table with 5 sample tasks
   - ✅ inbox_items table with 2 sample items
   - ✅ voice_notes table (empty)
   - ✅ All indexes and constraints

3. **Environment variables:**
   All credentials are already configured in `.env`

4. **Run development server:**
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (optional: ?status=pending&limit=3)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/step/:stepIndex` - Update task step
- `DELETE /api/tasks/:id` - Delete task

### Inbox
- `GET /api/inbox` - Get all inbox items
- `POST /api/inbox/screenshot` - Upload screenshot (multipart/form-data)
- `POST /api/inbox/pdf` - Upload PDF (multipart/form-data)
- `POST /api/inbox/manual` - Add manual note
- `POST /api/inbox/:id/create-task` - Create task from inbox item
- `PATCH /api/inbox/:id/archive` - Archive inbox item

### Voice
- `GET /api/voice` - Get all voice notes
- `POST /api/voice/record` - Upload voice recording (multipart/form-data)
- `POST /api/voice/:id/create-task` - Create task from voice note
- `DELETE /api/voice/:id` - Delete voice note

### Focus
- `GET /api/focus/recommend` - Get AI-recommended focus task and schedule

### Pulse
- `GET /api/pulse` - Get academic pulse analytics

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **OpenRouter** - AI/LLM integration (GPT-4o-mini)
- **Tesseract.js** - OCR for screenshots
- **pdf-parse** - PDF text extraction
- **Multer** - File uploads
