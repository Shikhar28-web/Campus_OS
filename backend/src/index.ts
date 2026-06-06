import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { supabase } from './config/db';

// Routes
import tasksRouter from './routes/tasks';
import inboxRouter from './routes/inbox';
import focusRouter from './routes/focus';
import pulseRouter from './routes/pulse';
import voiceRouter from './routes/voice';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database setup check endpoint
app.get('/api/setup-check', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tasks').select('*').limit(1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        setup: false,
        error: error.message,
        instructions: 'Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor'
      });
    }
    
    res.json({
      success: true,
      setup: true,
      message: 'Database is configured correctly',
      sampleTasksCount: data?.length || 0
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      setup: false,
      error: error.message,
      instructions: 'Check your Supabase credentials in .env file'
    });
  }
});

// API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/focus', focusRouter);
app.use('/api/pulse', pulseRouter);
app.use('/api/voice', voiceRouter);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, async () => {
  console.log(`🚀 CampusOS Backend running on http://localhost:${PORT}`);
  console.log(`📱 Network access: http://<your-ip>:${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Setup check: http://localhost:${PORT}/api/setup-check`);
  console.log(`\n💡 To access from mobile, use one of these URLs:`);
  console.log(`   - http://10.2.204.89:${PORT}/health`);
  console.log(`   - http://172.16.0.2:${PORT}/health`);
  console.log(`   - http://172.26.208.1:${PORT}/health\n`);
  
  // Check database connection
  console.log('✅ Using in-memory mock database\n');
});
