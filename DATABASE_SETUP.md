# Database Schema & API Documentation

## Overview
This document describes the FlowFunded database schema, API endpoints, and setup instructions.

## Database Setup Instructions

### 1. Run Migrations in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration
5. Copy the contents of `supabase/migrations/002_seed_data.sql` and run it for sample data

### 2. Enable Required Extensions
Run these in the SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 3. Verify Setup
Check the Tables tab in Supabase Dashboard to confirm all tables were created:
- ✓ challenges
- ✓ user_profiles
- ✓ user_challenges
- ✓ trades
- ✓ performance_metrics
- ✓ payouts

## Database Schema

### challenges
Stores available trading challenges.
- `id` - UUID primary key
- `name` - Challenge name (e.g., "Beginner 10K")
- `account_size` - Starting account balance
- `max_loss_percent` - Total max drawdown allowed
- `daily_loss_percent` - Daily max loss limit
- `min_profit_target` - Profit target to pass
- `profit_split_percent` - User's share of profits
- `price` - Cost to purchase challenge
- `difficulty` - Beginner/Intermediate/Advanced

### user_profiles
Extends Supabase auth with trader profile data.
- `id` - Foreign key to auth.users
- `account_balance` - Total available funds
- `total_profit` - Cumulative profits
- `win_rate` - Trading win percentage
- `tier` - Starter/Professional/Elite/Master
- `is_verified` - Can appear on leaderboard

### user_challenges
Junction table for challenge purchases/enrollments.
- `user_id` - FK to user_profiles
- `challenge_id` - FK to challenges
- `status` - Active/Completed/Failed/Paused
- `starting_balance` - Initial account size
- `current_balance` - Current account value
- `passed` - Whether challenge was passed
- `total_trades` - Number of trades opened

### trades
Individual trades within a challenge.
- `user_challenge_id` - FK to user_challenges
- `symbol` - Trading pair (e.g., EURUSD)
- `entry_price` - Entry price
- `exit_price` - Exit price (null if open)
- `profit_loss` - P&L amount
- `status` - Open/Closed/Cancelled

### performance_metrics
Daily/period stats for a challenge.
- `user_challenge_id` - FK to user_challenges
- `metric_date` - Date of metrics
- `daily_profit_loss` - Day's P&L
- `daily_return_percent` - Day's % return
- `win_rate` - Win % for the period

### payouts
Payout history for completed challenges.
- `user_id` - FK to user_profiles
- `user_challenge_id` - FK to user_challenges
- `profit_amount` - Total profit to split
- `user_payout_amount` - User's share
- `status` - Pending/Processing/Completed/Failed

## API Endpoints

### GET /api/challenges
Fetch all active challenges.

**Query Parameters:**
- `difficulty` - Filter by difficulty (Beginner/Intermediate/Advanced)
- `active` - Filter by status (default: true)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Beginner 10K",
    "account_size": 10000,
    "price": 99,
    "difficulty": "Beginner",
    ...
  }
]
```

### GET /api/dashboard/stats
Get logged-in user's dashboard statistics.

**Authentication:** Required (JWT token)

**Response:**
```json
{
  "stats": {
    "accountBalance": 15000,
    "activeChallenges": 2,
    "totalProfit": 5000,
    "winRate": 65.5
  },
  "profile": { ... },
  "activeChallenges": [ ... ],
  "recentTrades": [ ... ],
  "recentActivity": [ ... ]
}
```

### GET /api/leaderboard
Fetch top traders leaderboard.

**Query Parameters:**
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "full_name": "Jordan Pro",
      "account_balance": 50000,
      "total_profit": 25000,
      "win_rate": 72.3,
      "tier": "Elite"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

## Row Level Security (RLS)

All tables have RLS enabled to protect user data:

- **user_profiles**: Users can only view their own + public verified profiles
- **user_challenges**: Users can only view their own challenges
- **trades**: Users can only view their own trades
- **performance_metrics**: Users can only view their own metrics
- **payouts**: Users can only view their own payouts
- **challenges**: Public read-only (all users can view)

## Next Steps

1. **Run migrations** in Supabase SQL Editor
2. **Test API endpoints** with Postman or curl
3. **Update dashboard component** to fetch from `/api/dashboard/stats`
4. **Create individual pages** for challenges, leaderboard, etc.
5. **Add payment integration** for challenge purchases

## Seed Data

Sample data includes:
- 7 pre-configured challenges (Beginner to Master)
- 5 sample user profiles with realistic trading stats
- Ready for testing the dashboard and leaderboard

## Security Notes

- ✓ All API routes require authentication where needed
- ✓ RLS policies enforce user data isolation
- ✓ SQL injection is prevented via parameterized queries
- ✓ Sensitive data is protected with proper field-level access control

## Troubleshooting

**"relation does not exist" error:**
- Ensure migrations were run in order
- Check Supabase dashboard Tables tab

**"permission denied" error:**
- Check RLS policies
- Verify user is authenticated
- Ensure JWT token is valid

**Missing seed data:**
- Run the 002_seed_data.sql migration
- Check user_profiles table in dashboard
