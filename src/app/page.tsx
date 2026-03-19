'use client';
/** Splash/landing page with animated FASTSOCIO logo and aura orb */
import { motion } from 'framer-motion';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import AuraOrb from '@/components/aura/AuraOrb';
import NeonButton from '@/components/shared/NeonButton';

export default function SplashPage() {
  return (
    <MobileContainer noPadding>
      <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)' }} />
        </div>
        <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }} />

        {/* Animated Aura Orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <AuraOrb size={120} color="#A855F7" />
        </motion.div>

        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-heading text-5xl font-bold mb-3 tracking-tight"
        >
          <span className="aura-gradient">FAST</span>
          <span className="text-white">SOCIO</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-text-secondary text-sm mb-12 text-center italic"
        >
          Your University. Your Reputation. Your Game.
        </motion.p>

        {/* Enter Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <Link href="/login" className="w-full max-w-[280px]">
            <NeonButton fullWidth size="lg">Enter FASTSOCIO</NeonButton>
          </Link>
          <Link href="/login" className="text-sm text-text-dim hover:text-purple transition-colors">
            Already a member? Sign in
          </Link>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 text-text-dim text-xs text-center"
        >
          Exclusively for FAST-NUCES Islamabad 🎓
        </motion.div>
      </div>
    </MobileContainer>
  );
}
