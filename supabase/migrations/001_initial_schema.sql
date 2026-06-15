-- Challenges Table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  account_size DECIMAL(12, 2) NOT NULL,
  initial_balance DECIMAL(12, 2) NOT NULL,
  max_loss_percent DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  daily_loss_percent DECIMAL(5, 2) NOT NULL DEFAULT 3.0,
  min_profit_target DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
  profit_split_percent INT NOT NULL DEFAULT 80,
  duration_days INT NOT NULL DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends Supabase auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  account_balance DECIMAL(12, 2) DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  total_loss DECIMAL(12, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  challenge_count INT DEFAULT 0,
  completed_challenge_count INT DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'Starter' CHECK (tier IN ('Starter', 'Professional', 'Elite', 'Master')),
  is_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Challenges Table (Purchases/Enrollments)
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  starting_balance DECIMAL(12, 2) NOT NULL,
  current_balance DECIMAL(12, 2) NOT NULL,
  current_profit_loss DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Failed', 'Paused')),
  failure_reason VARCHAR(255),
  passed BOOLEAN DEFAULT FALSE,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  largest_win DECIMAL(12, 2) DEFAULT 0,
  largest_loss DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Trades Table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  entry_price DECIMAL(12, 5) NOT NULL,
  exit_price DECIMAL(12, 5),
  quantity DECIMAL(12, 2) NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  profit_loss DECIMAL(12, 2),
  profit_loss_percent DECIMAL(6, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table (Daily/Weekly/Monthly stats)
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  daily_profit_loss DECIMAL(12, 2) DEFAULT 0,
  daily_return_percent DECIMAL(6, 2) DEFAULT 0,
  num_trades INT DEFAULT 0,
  num_winning_trades INT DEFAULT 0,
  num_losing_trades INT DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  largest_win DECIMAL(12, 2) DEFAULT 0,
  largest_loss DECIMAL(12, 2) DEFAULT 0,
  account_balance DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_challenge_id, metric_date)
);

-- Payouts Table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  profit_amount DECIMAL(12, 2) NOT NULL,
  user_share_percent INT NOT NULL,
  user_payout_amount DECIMAL(12, 2) NOT NULL,
  company_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
  payout_method VARCHAR(50) CHECK (payout_method IN ('Bank Transfer', 'Crypto', 'PayPal', 'Stripe')),
  payout_date TIMESTAMP WITH TIME ZONE,
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard View (Top Performers)
CREATE VIEW leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY up.total_profit DESC) as rank,
  up.id,
  up.full_name,
  up.avatar_url,
  up.account_balance,
  up.total_profit,
  up.total_loss,
  up.win_rate,
  up.completed_challenge_count,
  up.tier,
  up.created_at
FROM user_profiles up
WHERE up.is_verified = TRUE
ORDER BY up.total_profit DESC
LIMIT 100;

-- Indexes for performance
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
CREATE INDEX idx_trades_user_challenge_id ON trades(user_challenge_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_performance_metrics_user_challenge_id ON performance_metrics(user_challenge_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(metric_date);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can view public leaderboard
CREATE POLICY "Leaderboard is public" ON user_profiles
  FOR SELECT USING (is_verified = TRUE);

-- Users can only view their own challenges
CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only view own trades
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (
    user_challenge_id IN (
      SELECT id FROM user_challenges WHERE user_id = auth.uid()
    )
  );

-- Users can only view own performance metrics
CREATE POLICY "Users can view own performance" ON performance_metrics
  FOR SELECT USING (
    user_challenge_id IN (
      SELECT id FROM user_challenges WHERE user_id = auth.uid()
    )
  );

-- Users can view own payouts
CREATE POLICY "Users can view own payouts" ON payouts
  FOR SELECT USING (auth.uid() = user_id);
