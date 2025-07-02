# Supabase Integration Setup Guide

This guide will help you set up Supabase authentication and database for your Office Hours Calculator app.

## 🚀 Features Added

- **Authentication**: Email/password login and signup with persistent sessions
- **Time Logging**: Save calculator results to database with confirmation
- **Dashboard**: View monthly time entries with calendar, table, and charts
- **Admin Access**: Special access for admin users to view all user data
- **Responsive Design**: All new components match the existing glassmorphism theme

## 📋 Prerequisites

1. Supabase account (free tier is sufficient)
2. Node.js and npm installed
3. Your existing Office Hours Calculator project

## 🔧 Supabase Project Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: `office-hours-calculator`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users

### 2. Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJ...` (long string starting with eyJ)

### 3. Create Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_EMAIL=your-admin-email@company.com
```

**Important**: Replace the values with your actual Supabase credentials!

## 🗃️ Database Setup

### 1. Create the Time Entries Table

Go to Supabase Dashboard → SQL Editor and run this script:

```sql
-- Create time_entries table
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

-- Create edit history table for tracking changes
CREATE TABLE time_entries_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  edit_type VARCHAR(20) DEFAULT 'update', -- 'create', 'update', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own entries
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

-- Users can view their own edit history
CREATE POLICY "Users can view own edit history" 
  ON time_entries_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own edit history
CREATE POLICY "Users can insert own edit history" 
  ON time_entries_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin users can view all entries (replace with your admin email)
CREATE POLICY "Admin can view all time entries" 
  ON time_entries FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'your-admin-email@company.com'
    )
  );

-- Admin users can view all edit history (replace with your admin email)
CREATE POLICY "Admin can view all edit history" 
  ON time_entries_history FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'your-admin-email@company.com'
    )
  );

-- Function to automatically create edit history when time_entries are updated
CREATE OR REPLACE FUNCTION create_edit_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history for updates, not inserts
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO time_entries_history (
      time_entry_id,
      user_id,
      edited_by,
      previous_data,
      new_data,
      edit_type
    ) VALUES (
      OLD.id,
      OLD.user_id,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW),
      'update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track edits
CREATE TRIGGER time_entries_edit_history_trigger
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION create_edit_history();
```

**Important**: Replace `your-admin-email@company.com` with your actual admin email!

### 2. Configure Authentication

1. Go to Authentication → Settings
2. Set up email configuration:
   - **Site URL**: `https://your-domain.com` (or `http://localhost:5173` for development)
   - **Redirect URLs**: Add your production and development URLs

## 🛠️ Installation & Development

### 1. Install Dependencies

The required packages have already been installed:
- `@supabase/supabase-js`
- `react-router-dom`
- `react-calendar`
- `recharts`
- `date-fns`

### 2. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/work-hours-calculator/`

### 3. Test the Features

1. **Calculator**: Should work as before (no login required)
2. **Time Logging**: After calculating, click "Log Today's Entry"
   - If not logged in: Shows login modal
   - If logged in: Shows confirmation and saves to database
3. **Dashboard**: Navigate via top navigation (requires login)
   - View calendar and select dates
   - See monthly time entries table
   - View working hours chart
   - Check monthly statistics

## 🚀 Deployment

### 1. Update Environment Variables

For production, set environment variables in your hosting platform:

**Vercel/Netlify/GitHub Pages:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_EMAIL=your-admin-email@company.com
```

### 2. Build and Deploy

```bash
npm run build
npm run deploy
```

### 3. Update Supabase URLs

In Supabase Dashboard → Authentication → Settings:
- Update **Site URL** to your production domain
- Add production URL to **Redirect URLs**

## 🔑 User Guide

### For Regular Users

1. **Calculator**: Use without login as before
2. **Save Entries**: Click "Log Today's Entry" → Sign up/in if needed → Confirm
3. **View Dashboard**: Sign in → Click "Dashboard" in navigation
4. **Calendar**: Select different months to view historical data
5. **Charts**: Visual representation of working hours over time

### For Admin Users

- Same as regular users, plus:
- See "Admin View" badge in dashboard
- Can view all users' time entries (future enhancement)

## 🛡️ Security Features

- **Row Level Security**: Users can only see their own data
- **Admin Policies**: Admin access based on email address
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Protected Routes**: Dashboard requires authentication

## 🎨 Design Integration

All new components maintain the existing:
- **Glassmorphism effects**: Backdrop blur and transparency
- **Gradient themes**: Pink, purple, cyan color scheme
- **Responsive design**: Mobile-first approach
- **Animation consistency**: Smooth transitions and hover effects

## 🔧 Customization

### Change Admin Email

1. Update `.env` file: `VITE_ADMIN_EMAIL=new-admin@company.com`
2. Update Supabase policy:
   ```sql
   -- Update the admin policy
   DROP POLICY "Admin can view all time entries" ON time_entries;
   CREATE POLICY "Admin can view all time entries" 
     ON time_entries FOR ALL 
     USING (
       EXISTS (
         SELECT 1 FROM auth.users 
         WHERE auth.users.id = auth.uid() 
         AND auth.users.email = 'new-admin@company.com'
       )
     );
   ```

### Modify Required Hours

In `src/components/TimeCalculator.jsx`:
```javascript
const REQUIRED_HOURS = 8.5; // Change this value
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env` file exists and has correct variable names
   - Restart development server after adding `.env`

2. **"Error inserting time entry"**
   - Verify database table was created correctly
   - Check RLS policies are applied
   - Ensure user is authenticated

3. **Login modal doesn't work**
   - Check Supabase project is active
   - Verify API keys are correct
   - Check browser network tab for errors

4. **Dashboard shows "No data"**
   - Save some time entries first using the calculator
   - Check date range (calendar month selection)
   - Verify database has data using Supabase dashboard

### Support

If you encounter issues:
1. Check browser console for error messages
2. Verify Supabase dashboard for data and logs
3. Ensure all environment variables are set correctly
4. Test with a fresh incognito browser session

## 🎯 Next Steps

The integration is complete! You can now:
- Use the calculator as before (public access)
- Save time entries to database (requires login)
- View detailed analytics in the dashboard
- Manage user authentication seamlessly

The app maintains backward compatibility while adding powerful new features for logged-in users. 