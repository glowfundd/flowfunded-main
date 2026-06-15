// FlowFunded Database Types

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  payout_wallet?: string;
  payout_method?: "crypto" | "bank";
  role?: "user" | "admin";
  is_banned?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  account_size: number;
  phase: 1 | 2 | 3;
  status: "active" | "passed" | "failed" | "funded";
  profit_target: number;
  max_drawdown: number;
  daily_loss_limit: number;
  starting_balance: number;
  current_balance: number;
  peak_balance: number;
  platform: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  challenge_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price?: number;
  lot_size: number;
  pnl?: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at?: string;
}

export interface EquitySnapshot {
  id: string;
  challenge_id: string;
  user_id: string;
  date: string;
  balance: number;
  equity: number;
  daily_pnl: number;
  created_at: string;
}

export interface Payout {
  id: string;
  user_id: string;
  challenge_id?: string;
  amount: number;
  profit_split: number;
  gross_profit: number;
  method: "crypto_usdt" | "crypto_btc" | "bank_wire";
  wallet_address?: string;
  status: "pending" | "processing" | "completed" | "rejected";
  requested_at: string;
  processed_at?: string;
  tx_hash?: string;
  notes?: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  account_size: string;
  fee: string;
  coin: "USDT_TRC20" | "USDT_ERC20" | "BTC" | "ETH";
  tx_hash: string;
  amount_claimed: number;
  status: "pending" | "confirmed" | "rejected";
  admin_note?: string;
  created_at: string;
  confirmed_at?: string;
  // joined fields for admin view
  user_email?: string;
  user_name?: string;
}
