'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">

      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center px-6 z-10 max-w-lg w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink mb-4 shadow-lg shadow-accent-purple/30">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Samilator
          </h1>
          <p className="text-text-secondary mt-2 text-base">
            מערכת אימון מכירות מקצועית
          </p>
        </motion.div>

        {/* Divider */}
        <div className="w-16 h-px bg-gradient-to-l from-transparent via-accent-purple/50 to-transparent mb-8" />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col gap-4 w-full"
        >
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-l from-accent-purple to-accent-pink text-white font-bold py-4 px-8 rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-accent-purple/20"
          >
            אני צאטר
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-bg-card border border-bg-hover text-text-primary font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-bg-hover hover:border-accent-purple/40 active:scale-95 transition-all"
          >
            אני מנהל
          </button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text-muted text-xs mt-8"
        >
          כל הזכויות שמורות © 2025 Samilator
        </motion.p>
      </motion.div>
    </div>
  )
}
