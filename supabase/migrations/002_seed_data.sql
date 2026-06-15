-- Sample challenges data
INSERT INTO challenges (name, description, account_size, initial_balance, max_loss_percent, daily_loss_percent, min_profit_target, profit_split_percent, duration_days, price, difficulty) VALUES
('Beginner 10K', 'Perfect for traders starting their journey. $10,000 account with 5% max loss and 3% daily limit.', 10000.00, 10000.00, 5.0, 3.0, 10.0, 80, 30, 99.00, 'Beginner'),
('Intermediate 25K', 'For experienced traders. $25,000 account with flexible rules and higher profit targets.', 25000.00, 25000.00, 5.0, 3.0, 8.0, 80, 30, 199.00, 'Intermediate'),
('Advanced 50K', 'Elite traders only. $50,000 account with professional standards and scaling opportunities.', 50000.00, 50000.00, 5.0, 3.0, 5.0, 80, 30, 399.00, 'Advanced'),
('Pro 100K', 'Premium funding tier. $100,000 account with minimal restrictions for proven traders.', 100000.00, 100000.00, 5.0, 3.0, 3.0, 85, 60, 799.00, 'Advanced'),
('Master 500K', 'Exclusive master tier. $500,000 account with custom terms for elite performers.', 500000.00, 500000.00, 3.0, 2.0, 2.0, 90, 90, 2999.00, 'Advanced'),
('Rapid Fire 10K', '7-day express challenge. Prove yourself quickly with $10,000 account.', 10000.00, 10000.00, 5.0, 3.0, 15.0, 80, 7, 49.00, 'Beginner'),
('Scaling Challenge 50K', 'Start at $50K, scale up to $250K by hitting targets.', 50000.00, 50000.00, 5.0, 3.0, 10.0, 80, 60, 499.00, 'Advanced');

-- Sample user profiles (using UUIDs you might need to adjust)
-- These will be created when users sign up, but here are examples for testing
INSERT INTO user_profiles (id, email, full_name, account_balance, total_profit, total_loss, win_rate, challenge_count, completed_challenge_count, tier, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alex@example.com', 'Alex Trader', 15000.00, 5000.00, 1000.00, 65.5, 3, 2, 'Professional', TRUE),
('550e8400-e29b-41d4-a716-446655440001', 'jordan@example.com', 'Jordan Pro', 50000.00, 25000.00, 3000.00, 72.3, 5, 4, 'Elite', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'sam@example.com', 'Sam Master', 150000.00, 85000.00, 5000.00, 78.9, 8, 7, 'Master', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'taylor@example.com', 'Taylor Rising', 25000.00, 12000.00, 2500.00, 68.2, 2, 1, 'Professional', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'casey@example.com', 'Casey Newcomer', 5000.00, 500.00, 1500.00, 55.0, 1, 0, 'Starter', FALSE);
