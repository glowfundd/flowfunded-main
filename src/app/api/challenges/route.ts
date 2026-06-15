import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const difficulty = searchParams.get("difficulty");
    const isActive = searchParams.get("active") !== "false";

    let query = supabase
      .from("challenges")
      .select("*")
      .eq("is_active", isActive)
      .order("price", { ascending: true });

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/challenges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin users can create challenges
    // This should be checked against a roles table in production
    const challengeData = await request.json();

    const { data, error } = await supabase
      .from("challenges")
      .insert([
        {
          name: challengeData.name,
          description: challengeData.description,
          account_size: challengeData.account_size,
          initial_balance: challengeData.initial_balance,
          max_loss_percent: challengeData.max_loss_percent,
          daily_loss_percent: challengeData.daily_loss_percent,
          min_profit_target: challengeData.min_profit_target,
          profit_split_percent: challengeData.profit_split_percent,
          duration_days: challengeData.duration_days,
          price: challengeData.price,
          difficulty: challengeData.difficulty,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/challenges error:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}
