"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const HEADLINE_LINE_1 = "Project management built for";
const HEADLINE_LINE_2 = "teams that ship fast.";

function HeroHeadline({ className = "" }: { className?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.12] font-normal tracking-tight ${className}`}
      style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
    >
      <span
        className="block"
        style={{
          color: "var(--auth-headline-1)",
          textShadow: "0 0 40px rgba(167, 139, 250, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)",
        }}
      >
        {HEADLINE_LINE_1}
      </span>
      <span
        className="mt-2 block"
        style={{
          color: "var(--auth-headline-2)",
          textShadow: "0 0 40px rgba(167, 139, 250, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)",
        }}
      >
        {HEADLINE_LINE_2}
      </span>
    </motion.h1>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-auth-bg text-foreground lg:grid lg:grid-cols-2">
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] dark:bg-indigo-600/20" />
        <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/8 blur-[140px] dark:bg-violet-600/10" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/8 blur-[100px] dark:bg-blue-600/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative hidden min-h-screen flex-col justify-between border-r border-border bg-auth-panel p-12 xl:p-20 lg:flex"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(var(--auth-grid) 1px, transparent 1px), linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top left, var(--auth-glow), transparent 55%)",
          }}
        />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 text-sm font-medium text-indigo-600 shadow-lg shadow-indigo-600/10 dark:text-indigo-300">
            <Zap className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Nexus Workspace</span>
          </div>

          <HeroHeadline className="max-w-2xl" />

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground xl:text-[15px]">
            Coordinate projects, track tasks, and keep your team aligned — all
            from a single, powerful workspace.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            { value: "98%", label: "on-time delivery rate" },
            { value: "3.4x", label: "faster completion" },
            { value: "12k+", label: "active teams" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl font-bold tracking-tight text-foreground xl:text-3xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-12 xl:left-20">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-sm font-bold text-muted-foreground"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            N
          </div>
        </div>
      </motion.div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          <div className="mb-8 space-y-5 lg:hidden">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-300">
              <Zap className="h-4 w-4" />
              <span>Nexus Workspace</span>
            </div>
            <HeroHeadline />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Coordinate projects, track tasks, and keep your team aligned.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-auth-card p-8 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20 sm:p-9">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to your workspace
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexus.io"
                    className="w-full rounded-xl border border-border bg-auth-input py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground shadow-inner transition-all outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-auth-input py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground shadow-inner transition-all outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure access for administrators, managers, and team members.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
