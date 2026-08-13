"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Zap, ArrowRight, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NexusLogo from "@/components/ui/NexusLogo";
import {
  easeTransition,
  slideInLeftVariants,
  slideInRightVariants,
  staggerContainer,
  staggerContainerFast,
} from "@/lib/motion";

const HEADLINE_LINE_1 = "Project management built for";
const HEADLINE_LINE_2 = "teams that ship fast.";

const STATS = [
  { value: "98%", label: "on-time delivery rate" },
  { value: "3.4x", label: "faster completion" },
  { value: "12k+", label: "active teams" },
];

function FloatingOrb({
  className,
  duration,
  delay = 0,
}: {
  className: string;
  duration: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className} />;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -18, 0], x: [0, 10, 0], scale: [1, 1.06, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function HeroHeadline({ className = "" }: { className?: string }) {
  return (
    <motion.h1
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.12, delayChildren: 0.1 },
        },
      }}
      className={`text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.12] font-normal tracking-tight ${className}`}
      style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
    >
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: easeTransition },
        }}
        className="block"
        style={{
          color: "var(--auth-headline-1)",
          textShadow:
            "0 0 40px rgba(167, 139, 250, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)",
        }}
      >
        {HEADLINE_LINE_1}
      </motion.span>
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: easeTransition },
        }}
        className="mt-2 block"
        style={{
          color: "var(--auth-headline-2)",
          textShadow:
            "0 0 40px rgba(167, 139, 250, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)",
        }}
      >
        {HEADLINE_LINE_2}
      </motion.span>
    </motion.h1>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...easeTransition }}
        className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6"
      >
        <ThemeToggle />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingOrb
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] dark:bg-indigo-600/20"
          duration={8}
        />
        <FloatingOrb
          className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/8 blur-[140px] dark:bg-violet-600/10"
          duration={10}
          delay={1}
        />
        <FloatingOrb
          className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/8 blur-[100px] dark:bg-blue-600/10"
          duration={9}
          delay={0.5}
        />
      </div>

      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={slideInLeftVariants}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
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

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 space-y-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: easeTransition },
            }}
            className="inline-flex items-center gap-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 text-sm font-medium text-indigo-600 shadow-lg shadow-indigo-600/10 dark:text-indigo-300"
          >
            <motion.span
              animate={reduceMotion ? {} : { rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Zap className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            </motion.span>
            <span>Nexus Workspace</span>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <HeroHeadline className="max-w-2xl" />
          </motion.div>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: easeTransition },
            }}
            className="max-w-md text-sm leading-relaxed text-muted-foreground xl:text-[15px]"
          >
            Coordinate projects, track tasks, and keep your team aligned — all
            from a single, powerful workspace.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
          className="relative z-10 grid grid-cols-3 gap-6 border-t border-border pt-8"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: easeTransition },
              }}
            >
              <div
                className="text-2xl font-bold tracking-tight text-foreground xl:text-3xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, ...easeTransition }}
          className="absolute bottom-8 left-12 xl:left-20"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <NexusLogo size="lg" />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0 lg:px-16">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={slideInRightVariants}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[420px]"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-8 space-y-5 lg:hidden"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: easeTransition },
              }}
              className="inline-flex items-center gap-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-300"
            >
              <Zap className="h-4 w-4" />
              <span>Nexus Workspace</span>
            </motion.div>
            <HeroHeadline />
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: easeTransition },
              }}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              Coordinate projects, track tasks, and keep your team aligned.
            </motion.p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, ...easeTransition }}
            className="rounded-3xl border border-border bg-auth-card p-8 font-sans shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20 sm:p-9"
          >
            <div className="mb-8">
              <h2
                className="text-2xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm font-sans text-muted-foreground">
                Sign in to your workspace
              </p>
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  className="mb-6 flex items-center gap-2.5 overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              variants={staggerContainerFast}
              initial="hidden"
              animate="visible"
              onSubmit={handleLogin}
              className="auth-form space-y-5"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 12 },
                  visible: { opacity: 1, x: 0, transition: easeTransition },
                }}
              >
                <label className="mb-2 block font-sans text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
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
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-auth-input py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground shadow-inner outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 12 },
                  visible: { opacity: 1, x: 0, transition: easeTransition },
                }}
              >
                <label className="mb-2 block font-sans text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
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
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-border bg-auth-input py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground shadow-inner outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </motion.div>

              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: easeTransition },
                }}
                whileHover={reduceMotion ? {} : { scale: 1.02 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-50"
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
              </motion.button>
            </motion.form>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 text-center font-sans text-xs text-muted-foreground"
          >
            Secure access for administrators, managers, and team members.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
