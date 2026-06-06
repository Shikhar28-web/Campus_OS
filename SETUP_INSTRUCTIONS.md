# CampusOS Setup Instructions

## ⚠️ CRITICAL: Supabase Setup Required

Your backend is currently unable to connect to Supabase. Follow these steps:

## Step 1: Verify Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if you have a project with ID: `pihzhgklaxpgzfucqwbh`
3. If NOT, you need to either:
   - Create a new Supabase project, OR
   - Use your existing project's credentials

## Step 2: Get Correct Credentials

### If you have an existing Supabase project:

1. Go to your project dashboard
2. Click on **Settings** → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Service Role Key** (secret, starts with `eyJ...`)

### If you need to create a new project:

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Fill in:
   - Name: `CampusOS`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
4. Wait 2-3 minutes for project to initialize
5. Go to **Settings** → **API** and copy the credentials

## Step 3: Update Backend .env File

Edit `backend/.env` and replace with YOUR credentials:

```env
PORT=5000
NODE_ENV=development

# Supabase - REPLACE WITH YOUR VALUES
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# JWT
JWT_SECRET=your-jwt-secret-here

# OpenRouter AI
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

## Step 4: Create Database Tables

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `backend/supabase-schema.sql` in a text editor
5. Copy ALL the SQL content
6. Paste into the Supabase SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success. No rows returned" message

## Step 5: Restart Backend

After updating .env:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
```

## Step 6: Test the Application

1. Open http://localhost:5173 in your browser
2. You should see the Dashboard with sample tasks
3. Try navigating to different sections (Inbox, Focus, Pulse, Voice)

## Troubleshooting

### Error: "fetch failed" or "ENOTFOUND"
- Your SUPABASE_URL is incorrect or unreachable
- Check the URL in .env matches your project exactly
- Try pinging the URL to verify network connectivity

### Error: "relation does not exist"
- The database tables aren't created
- Run the SQL schema from Step 4 above

### Error: "Invalid API key"
- Your SUPABASE_KEY is wrong
- Get the **service_role** key, not the anon key
- Make sure you copied the entire key (they're very long)

### Frontend shows empty lists
- Database tables exist but have no data
- Re-run the SQL schema to insert sample data

## Need Help?

Check these files for more details:
- `backend/README.md` - Backend API documentation
- `backend/supabase-schema.sql` - Database schema
- `frontend/README.md` - Frontend setup

## Quick Verification Commands

Test backend health:
```bash
curl http://localhost:5000/health
```

Test database connection:
```bash
curl http://localhost:5000/api/setup-check
```

Test tasks endpoint:
```bash
curl http://localhost:5000/api/tasks
```
