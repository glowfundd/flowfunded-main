import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Query the leaderboard view
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get total count for pagination
    const { count } = await supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_verified", true);

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
