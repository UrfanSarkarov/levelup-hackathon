"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function GirisPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Try admin login first
      const res = await fetch("/api/lup-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/idarepanel");
        return;
      }

      // 2. If admin login fails, try Supabase Auth (team login with email)
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (!authError && authData.user) {
        // Link team member record by email (if registered via form)
        await fetch('/api/link-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authData.user.id, email: authData.user.email }),
        });

        // Fetch role from server-side API (bypasses RLS)
        const roleRes = await fetch(`/api/user-role?userId=${authData.user.id}`);
        const roleData = await roleRes.json();
        const role = roleData?.role ?? 'team_member';

        const roleRedirects: Record<string, string> = {
          super_admin: '/idarepanel',
          trainer: '/telminci',
          mentor: '/mentor',
          jury: '/munsif',
          team_member: '/komanda',
        };
        router.push(roleRedirects[role] || '/komanda');
        return;
      }

      // Both failed
      setError("Yanlış istifadəçi adı/e-poçt və ya şifrə");
    } catch {
      setError("Şəbəkə xətası. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-2xl w-full max-w-md">
      <CardHeader className="text-center pb-0">
        <CardTitle className="text-2xl font-bold text-[#1A1A2E]">
          Daxil ol
        </CardTitle>
        <CardDescription className="text-[#718096]">
          Level UP Hackathon platformasına xoş gəldiniz
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* ─── Error banner ─── */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">İstifadəçi adı və ya e-poçt</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="admin və ya email@example.com"
              required
              autoComplete="username"
              className="h-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Şifrə</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718096] hover:text-[#0D47A1] transition-colors"
              >
                {showPass ? "Gizlə" : "Göstər"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-11 bg-[#0D47A1] hover:bg-[#1565C0] text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            Daxil ol
          </Button>
        </form>

        {/* ─── Registration link ─── */}
        <p className="mt-6 text-center text-sm text-[#718096]">
          Hesabınız yoxdur?{" "}
          <Link
            href="/qeydiyyat"
            className="font-semibold text-[#0D47A1] hover:text-[#1565C0] transition-colors"
          >
            Qeydiyyat
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
