-- Create holidays_leaves table
CREATE TABLE holidays_leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('holiday', 'leave')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE holidays_leaves ENABLE ROW LEVEL SECURITY;

-- Users can view their own holidays/leaves
CREATE POLICY "Users can view own holidays and leaves" 
  ON holidays_leaves FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own holidays/leaves
CREATE POLICY "Users can insert own holidays and leaves" 
  ON holidays_leaves FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own holidays/leaves
CREATE POLICY "Users can update own holidays and leaves" 
  ON holidays_leaves FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own holidays/leaves
CREATE POLICY "Users can delete own holidays and leaves" 
  ON holidays_leaves FOR DELETE 
  USING (auth.uid() = user_id);

-- Admin users can view all holidays/leaves
CREATE POLICY "Admin can view all holidays and leaves" 
  ON holidays_leaves FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'nilesh_patil@acedataanalytics.com'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_holidays_leaves_updated_at
  BEFORE UPDATE ON holidays_leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_holidays_leaves_user_date ON holidays_leaves(user_id, date);
CREATE INDEX idx_holidays_leaves_date ON holidays_leaves(date);
CREATE INDEX idx_holidays_leaves_type ON holidays_leaves(type); 