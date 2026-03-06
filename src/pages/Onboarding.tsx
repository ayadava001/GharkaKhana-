import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CookingPot, ChefHat, Calendar, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

const slides = [
  {
    id: 1,
    title: "Fridge mein kya hai? Batao!",
    subtitle: "Jo ingredients ghar mein hain, woh daalo. AI tumhare liye perfect recipe dhundhega.",
    illustration: (
      <div className="relative w-48 h-64 border-4 border-white rounded-lg flex flex-col p-4 overflow-hidden">
        <div className="w-full h-1 bg-white mb-4 opacity-50" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full h-8 border-2 border-white/30 rounded" />
          <div className="w-2/3 h-8 border-2 border-white/30 rounded" />
          <div className="w-full h-8 border-2 border-white/30 rounded" />
        </div>
        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
      </div>
    )
  },
  {
    id: 2,
    title: "AI Chef Ready Hai",
    subtitle: "Apne ghar ke ingredients se authentic Indian recipes pao — North Indian, South Indian, Bengali, Gujarati, sab kuch!",
    illustration: (
      <div className="relative flex flex-col items-center">
        <ChefHat size={120} strokeWidth={1} className="text-white" />
        <div className="absolute -top-4 -right-4 flex gap-2">
          <Sparkles size={24} className="text-white animate-pulse" />
          <Sparkles size={16} className="text-white/60 animate-bounce" />
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Poore Hafte Ka Meal Plan",
    subtitle: "Monday se Sunday tak — nashta, lunch, dinner. Nutrition info ke saath. Grocery list bhi automatic.",
    illustration: (
      <div className="relative w-56 h-48 border-2 border-white/40 rounded-xl p-3 grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-white/20 rounded-lg flex items-center justify-center p-1">
            <div className="w-full h-full bg-white/10 rounded-sm" />
          </div>
        ))}
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
          <Calendar size={20} />
        </div>
      </div>
    )
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dietPref, setDietPref] = useState<'Veg' | 'Non-Veg' | 'Both'>('Both');
  const navigate = useNavigate();
  const { setHasSeenOnboarding, setDietPreference } = useAppStore();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setDietPreference(dietPref);
    setHasSeenOnboarding(true);
    // Temporary: Direct access for testing
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 bg-primary-bg flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-center z-20">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: i === currentSlide ? 24 : 8,
                backgroundColor: i === currentSlide ? '#FFFFFF' : '#333333'
              }}
              className="h-2 rounded-full transition-all duration-300"
            />
          ))}
        </div>
        <button 
          onClick={handleComplete}
          className="text-secondary-text text-[13px] font-medium hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Carousel */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Illustration Area */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-12"
            >
              <div className="relative">
                {slides[currentSlide].illustration}
                {currentSlide === 0 && (
                  <div className="absolute inset-0 bg-white/5 blur-[40px] opacity-20 -z-10" />
                )}
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-2xl font-display font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h1>
              <p className="text-secondary-text text-[15px] leading-relaxed max-w-[280px] mx-auto">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>

            {/* Preference Selection on Slide 3 */}
            {currentSlide === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 w-full"
              >
                <p className="text-white text-sm font-medium mb-4">Aap kya prefer karte ho?</p>
                <div className="flex justify-center gap-3">
                  {(['Veg', 'Non-Veg', 'Both'] as const).map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setDietPref(pref)}
                      className={cn(
                        "px-6 py-2 rounded-full border text-sm font-medium transition-all",
                        dietPref === pref 
                          ? "border-white bg-white/10 text-white" 
                          : "border-[#333] text-secondary-text"
                      )}
                    >
                      {pref === 'Veg' && '🟢 '}
                      {pref === 'Non-Veg' && '🟠 '}
                      {pref === 'Both' && '🔵 '}
                      {pref}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="px-5 pb-12">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="w-full h-[54px] accent-gradient rounded-[14px] flex items-center justify-center text-[#0A0A0A] font-display font-semibold text-base shadow-2xl"
        >
          {currentSlide === slides.length - 1 ? "Shuru Karein! 🚀" : "Aage Badho →"}
        </motion.button>
      </div>
    </div>
  );
}
