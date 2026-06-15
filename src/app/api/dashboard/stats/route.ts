import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") throw profileError;

    // Get active challenges
    const { data: activeChallenges, error: challengesError } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Active");

    if (challengesError) throw challengesError;

    // Get recent trades
    const { data: recentTrades, error: tradesError } = await supabase
      .from("trades")
      .select(
        `
        id, symbol, entry_price, exit_price, entry_time, 
        status, profit_loss, user_challenge_id
      `
      )
      .in(
        "user_challenge_id",
        activeChallenges?.map((c) => c.id) || []
      )
      .order("entry_time", { ascending: false })
      .limit(10);

    if (tradesError) throw tradesError;

    // Get recent activity from payouts
    const { data: payouts, error: payoutsError } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (payoutsError) throw payoutsError;

    // Calculate stats
    const stats = {
      accountBalance: profile?.account_balance || 0,
      activeChallenges: activeChallenges?.length || 0,
      totalProfit: profile?.total_profit || 0,
      winRate: profile?.win_rate || 0,
    };

    return NextResponse.json({
      stats,
      profile,
      activeChallenges,
      recentTrades: recentTrades || [],
      recentActivity: payouts || [],
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
