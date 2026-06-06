import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
  },
};
