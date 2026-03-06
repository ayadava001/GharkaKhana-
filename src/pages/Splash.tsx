import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CookingPot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';

export default function Splash() {
  const navigate = useNavigate();
  const { hasSeenOnboarding } = useAppStore();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 800);
    const timer2 = setTimeout(() => setPhase(2), 1500);
    const timer3 = setTimeout(() => setPhase(3), 2000);
    const timer4 = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Temporary: Direct access for testing
      navigate('/home');
      /*
      if (session) {
        navigate('/home');
      } else if (hasSeenOnboarding) {
        navigate('/login');
      } else {
        navigate('/onboarding');
      }
      */
    };
    const timer4Id = setTimeout(timer4, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4Id);
    };
  }, [navigate, hasSeenOnboarding]);

  const appName = "GharKaKhana";

  return (
    <div className="fixed inset-0 bg-primary-bg flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '100vh' }}
            animate={{ 
              opacity: [0, 0.1, 0],
              y: '-10vh',
              x: `${Math.random() * 100}vw`
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: phase === 3 ? 0 : 1,
            scale: phase === 3 ? 1.05 : 1
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          {/* Phase 1: Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.8 
            }}
            className="relative"
          >
            <CookingPot size={80} className="text-white" />
            <motion.div 
              animate={{ y: [-2, -8, -2], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1"
            >
              <div className="w-1 h-3 bg-white/40 rounded-full blur-[1px]" />
              <div className="w-1 h-4 bg-white/60 rounded-full blur-[1px]" />
              <div className="w-1 h-3 bg-white/40 rounded-full blur-[1px]" />
            </motion.div>
          </motion.div>

          {/* Phase 2: App Name & Tagline */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex overflow-hidden">
              {appName.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 40, opacity: 0 }}
                  animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
                  transition={{ 
                    delay: 0.8 + i * 0.05,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  className="text-4xl font-display font-extrabold tracking-tighter text-white"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Phase 3: Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={phase >= 2 ? { width: 120 } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent my-4"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-secondary-text font-sans text-sm"
            >
              Ghar ka khana, AI ke saath
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
