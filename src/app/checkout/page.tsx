import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import CheckoutClient from "./CheckoutClient";

const validFees: Record<string, string> = {
  "$10,000": "$99",
  "$25,000": "$199",
  "$50,000": "$299",
  "$100,000": "$499",
  "$200,000": "$899",
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const requestedAccount = getSingleParam(params.account);
  const account = requestedAccount && validFees[requestedAccount] ? requestedAccount : "$50,000";
  const fee = validFees[account];
  const feeNum = parseFloat(fee.replace("$", ""));

  // If not logged in, redirect to login with redirect back to checkout
  if (!user) {
    const encodedAccount = encodeURIComponent(account);
    redirect(`/login?redirect=${encodeURIComponent(`/checkout?account=${encodedAccount}`)}`);
  }

  const wallets = {
    USDT_TRC20: process.env.PAYMENT_USDT_TRC20 ?? "TRC20_PLACEHOLDER_ADDRESS",
    USDT_ERC20: process.env.PAYMENT_USDT_ERC20 ?? "ERC20_PLACEHOLDER_ADDRESS",
    BTC: process.env.PAYMENT_BTC ?? "BTC_PLACEHOLDER_ADDRESS",
    ETH: process.env.PAYMENT_ETH ?? "ETH_PLACEHOLDER_ADDRESS",
  };

  return (
    <CheckoutClient
      account={account}
      fee={fee}
      feeNum={feeNum}
      userId={user.id}
      wallets={wallets}
    />
  );
}
