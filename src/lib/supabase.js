import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema inference based on the app logic:
/*
Expected Supabase table: time_entries

CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  break_in TIME,
  break_out TIME,
  total_hours DECIMAL(4,2),
  break_duration_minutes INTEGER,
  break_credit_minutes INTEGER,
  expected_leave_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS (Row Level Security) policies:
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own entries
CREATE POLICY "Users can view own time entries" 
  ON time_entries FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own time entries" 
  ON time_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own time entries" 
  ON time_entries FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admin users can view all entries (replace with your admin email)
CREATE POLICY "Admin can view all time entries" 
  ON time_entries FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@yourcompany.com'
    )
  );
*/ 