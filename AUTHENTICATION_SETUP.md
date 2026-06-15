# FlowFunded Authentication Setup Guide

## Quick Start with Supabase

This guide will help you set up Supabase for the FlowFunded authentication system.

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" and fill in the details:
   - **Project Name**: flowfunded (or your preferred name)
   - **Database Password**: Create a strong password and save it
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine for development

3. Wait for the project to be created (this takes a few minutes)

### Step 2: Get Your API Keys

1. Once your project is created, go to **Settings → API**
2. You'll see two keys:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Copy these values

### Step 3: Configure Environment Variables

1. In the project root, create a `.env.local` file (or copy from `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials.

### Step 4: Create Database Tables (Optional but Recommended)

1. In Supabase, go to **SQL Editor**
2. Create a new query and run this SQL to set up the `profiles` table:

```sql
-- Create profiles table to store additional user data
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policy for users to view their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Create policy for users to update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger to auto-create a profile when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Step 5: Test Authentication

1. Start the development server:

```bash
npm run dev
```

2. Navigate to http://localhost:3001/signup
3. Create a test account:
   - Email: test@example.com
   - Full Name: Test User
   - Password: Password123!

4. You should be redirected to the dashboard
5. Click "Sign Out" and try logging in at http://localhost:3001/login

### Step 6: Verify Setup in Supabase

1. In Supabase, go to **Authentication → Users**
2. You should see your test user listed
3. Go to **SQL Editor** and run:

```sql
select id, email, created_at from profiles;
```

You should see your test user's profile.

---

## Features Implemented

✅ **Authentication**
- User signup with email and password
- User login with email and password
- User logout
- Automatic session management

✅ **User Dashboard**
- Protected dashboard page (redirects to login if not authenticated)
- User profile display
- Quick stats (account status, challenges, profits)
- Action cards for starting challenges and managing account

✅ **Account Settings**
- Profile information management
- View account ID and email
- Change full name
- Password change (UI ready, backend integration pending)

✅ **Navigation Updates**
- Navbar shows "Dashboard" and "Sign Out" when logged in
- Navbar shows "Sign In" and "Start Challenge" when logged out
- Mobile-responsive auth menu

---

## Security Notes

⚠️ **For Production:**

1. **Enable Email Verification**: In Supabase Settings → Authentication → Email
   - Enable "Email confirmation"

2. **Enable Password Reset**: Already built into login page

3. **Configure CORS**: In Supabase Settings → API
   - Add your production domain to allowed origins

4. **Use Row Level Security (RLS)**:
   - All tables should have RLS policies enabled
   - Only users can access their own data

5. **Secure Environment Variables**:
   - Never commit `.env.local` to git
   - Use `.env.local` for local development only

---

## Troubleshooting

**"Missing Supabase environment variables" error**
- Check that `.env.local` exists and has correct values
- Restart the dev server after adding env variables

**"User not found" on login**
- Make sure the email matches exactly (case-sensitive)
- Check Supabase → Authentication → Users to see registered emails

**"Dashboard shows loading spinner forever"**
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Check Supabase project is running (not paused)

---

## Next Steps

1. **Payment Integration**: Add Stripe/Paddle for challenge purchases
2. **Challenge Tracking**: Store user challenges and progress in database
3. **Email Notifications**: Send welcome emails, password resets, notifications
4. **2FA**: Add two-factor authentication
5. **OAuth Integration**: Allow login with Google/GitHub

---

## File Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/page.tsx      # Protected dashboard
│   └── account/page.tsx        # Account settings
├── context/
│   └── AuthContext.tsx         # Global auth state
├── lib/
│   └── supabase.ts            # Supabase client config
└── components/
    └── Navbar.tsx             # Updated with auth
```

---

## Support

For help with Supabase:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Community Discord](https://discord.supabase.com)

For FlowFunded auth issues:
- Email: support@flowfunded.com
