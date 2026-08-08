'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import ParticleText from '@/components/ui/ParticleText' // Adjust path if located elsewhere

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const signIn = useAuthStore((state) => state.signIn)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')
        setLoading(true)

        const { error } = await signIn(email, password)
        setLoading(false)

        if (error) {
            setErrorMsg(error)
        } else {
            router.push('/dashboard')
        }
    }

    const fillDemo = (demoEmail: string) => {
        setEmail(demoEmail)
        setPassword('admin123')
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#090d16] text-white overflow-hidden">
            {/* Left Column: Branding & Stats with Framer Motion */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex flex-col justify-between p-12 xl:p-20 border-r border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-[#090d16] to-[#090d16] relative min-h-screen"
            >
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 font-medium text-sm border border-indigo-500/20 shadow-lg shadow-indigo-600/10">
                        <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span>Nexus Workspace</span>
                    </div>

                    {/* Split ParticleText Components with Controlled Row Heights */}
                    <div className="space-y-2">
                        <div className="w-full h-[65px] relative flex items-center">
                            <ParticleText
                                text="Project management built for"
                                particleSize={2}
                                density={1}
                                color="#f8fafc"
                                highlightColor="#8b5cf6"
                                scatter={150}
                                gatherDuration={1500}
                                stagger={300}
                                pointerRepel={30}
                                repelRadius={100}
                                idleDrift={0.5}
                                trigger="mount"
                                fontSize="clamp(1.8rem, 3.2vw, 2.8rem)"
                                fontWeight={800}
                                fontFamily="inherit"
                                glow
                            />
                        </div>
                        <div className="w-full h-[65px] relative flex items-center">
                            <ParticleText
                                text="teams that ship fast."
                                particleSize={2}
                                density={1}
                                color="#f8fafc"
                                highlightColor="#8b5cf6"
                                scatter={150}
                                gatherDuration={1500}
                                stagger={300}
                                pointerRepel={30}
                                repelRadius={100}
                                idleDrift={0.5}
                                trigger="mount"
                                fontSize="clamp(1.8rem, 3.2vw, 2.8rem)"
                                fontWeight={800}
                                fontFamily="inherit"
                                glow
                            />
                        </div>
                    </div>

                    <p className="text-slate-400 max-w-md text-sm xl:text-base leading-relaxed pt-2">
                        Coordinate projects, track tasks, and keep your team aligned — all from a single, powerful workspace.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
                    <div>
                        <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>98%</div>
                        <div className="text-xs text-slate-400 mt-1">on-time delivery rate</div>
                    </div>
                    <div>
                        <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>3.4x</div>
                        <div className="text-xs text-slate-400 mt-1">faster completion</div>
                    </div>
                    <div>
                        <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>12k+</div>
                        <div className="text-xs text-slate-400 mt-1">active teams</div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Sign In Form & Quick Access */}
            <div className="flex items-center justify-center p-8 lg:p-16 min-h-screen lg:min-h-0 bg-[#090d16]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-2">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Nexus</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Welcome back</h2>
                        <p className="text-sm text-slate-400 mt-1">Sign in to your workspace</p>
                    </div>

                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@nexus.io"
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 group"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                  
                </motion.div>
            </div>
        </div>
    )
}