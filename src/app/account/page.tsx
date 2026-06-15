"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2, Mail, User as UserIcon } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name || "",
        });

        setFullName(authUser.user_metadata?.full_name || "");
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (error) throw error;

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background pt-20 pb-24">
      {/* Background glows */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white">Account Settings</h1>
          <p className="text-gray-400 mt-2">Manage your profile and preferences</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="rounded-2xl glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

            {message && (
              <div className={`rounded-lg px-4 py-3 text-sm mb-6 ${
                message.includes("successfully")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed opacity-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                <input
                  type="text"
                  value={user?.id || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-mono text-xs cursor-not-allowed opacity-50"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 text-base font-bold text-black bg-primary rounded-full hover:bg-primary/95 disabled:bg-primary/50 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Section */}
          <div className="rounded-2xl glass-panel p-8">
            <h2 className="text-xl font-bold text-white mb-6">Security</h2>
            <div className="space-y-4">
              <button className="w-full text-left px-6 py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 text-white font-medium">
                Change Password
              </button>
              <button className="w-full text-left px-6 py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 text-white font-medium">
                Two-Factor Authentication
              </button>
              <button className="w-full text-left px-6 py-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 text-white font-medium">
                Active Sessions
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <h2 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h2>
            <button className="px-6 py-3 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-semibold transition-all duration-200">
              Delete Account
            </button>
            <p className="text-xs text-red-400/70 mt-2">This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
