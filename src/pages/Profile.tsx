import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, Bookmark, ClipboardList, Utensils, 
  Users, Flame, Languages, Crown, Settings as SettingsIcon, 
  Share2, Star, LifeBuoy, LogOut, X, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';

export default function Profile() {
  const navigate = useNavigate();
  const { dietPreference, setDietPreference } = useAppStore();
  const [isPreferenceOpen, setIsPreferenceOpen] = useState(false);

  const menuSections = [
    {
      title: "Mera Account",
      items: [
        { icon: <Bookmark size={20} />, label: "Saved Recipes", path: "/favorites" },
        { icon: <ClipboardList size={20} />, label: "My Grocery Lists", path: "/grocery-list" },
        { icon: <Utensils size={20} />, label: "Diet Preferences", action: () => setIsPreferenceOpen(true) },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: <Users size={20} />, label: "Family Size", value: "4 Members" },
        { icon: <Flame size={20} />, label: "Spice Level", value: "Medium" },
        { icon: <Languages size={20} />, label: "Language", value: "English" },
      ]
    },
    {
      title: "App",
      items: [
        { icon: <Crown size={20} className="text-yellow-500" />, label: "Premium Plan", path: "/premium" },
        { icon: <SettingsIcon size={20} />, label: "Settings", path: "/settings" },
        { icon: <Share2 size={20} />, label: "Share App", action: () => {} },
        { icon: <Star size={20} />, label: "Rate Us", action: () => {} },
        { icon: <LifeBuoy size={20} />, label: "Contact Support", action: () => {} },
        { icon: <LogOut size={20} className="text-red-500" />, label: "Log Out", action: () => navigate('/onboarding') },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* HEADER */}
      <header className="px-5 pt-12 pb-8 flex flex-col items-center text-center">
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full border-2 border-white bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] flex items-center justify-center mb-4 shadow-2xl"
        >
          <span className="text-white text-3xl font-bold">A</span>
        </motion.div>
        <h1 className="text-white text-[22px] font-display font-bold mb-1">Ayush Rajput</h1>
        <p className="text-[#666] text-sm mb-3">rajputayush0109@gmail.com</p>
        <button className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          Edit Profile
        </button>
      </header>

      {/* STATS */}
      <div className="px-5 mb-10">
        <div className="flex justify-between gap-3">
          {[
            { val: "12", label: "Recipes Tried", emoji: "🍛" },
            { val: "3", label: "Meal Plans", emoji: "📅" },
            { val: "45", label: "Days Active", emoji: "🔥" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 bg-secondary-bg border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center"
            >
              <span className="text-xl mb-2">{stat.emoji}</span>
              <span className="text-white font-display font-bold text-lg mb-0.5">{stat.val}</span>
              <span className="text-[#666] text-[10px] uppercase font-bold tracking-wider leading-tight">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div className="px-5 space-y-8">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[#666] text-[11px] font-bold uppercase tracking-[0.2em] px-1">{section.title}</h3>
            <div className="bg-secondary-bg border border-white/5 rounded-2xl overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path ? navigate(item.path) : item.action?.()}
                  className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-white/60">{item.icon}</div>
                    <span className="text-white text-[15px] font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-[#666] text-xs">{item.value}</span>}
                    <ChevronRight size={18} className="text-[#333]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DIET PREFERENCE EDITOR */}
      <AnimatePresence>
        {isPreferenceOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreferenceOpen(false)}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-secondary-bg rounded-t-[32px] z-[70] flex flex-col border-t border-white/10"
            >
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mt-3 mb-6" />
              
              <div className="px-6 flex items-center justify-between mb-8">
                <h2 className="text-white text-xl font-display font-bold">Diet Preferences 🍽</h2>
                <button onClick={() => setIsPreferenceOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-8">
                {/* Diet Type */}
                <section className="space-y-4">
                  <h4 className="text-[#666] text-xs font-bold uppercase tracking-widest">Diet Type</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Veg', 'Non-Veg', 'Eggetarian', 'Vegan', 'Jain', 'Both'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setDietPreference(type as any)}
                        className={cn(
                          "h-12 rounded-xl border flex items-center justify-center gap-2 transition-all",
                          dietPreference === type 
                            ? "accent-gradient text-black border-transparent font-bold" 
                            : "bg-white/5 border-white/5 text-white/60"
                        )}
                      >
                        {dietPreference === type && <Check size={16} />}
                        {type}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Allergies */}
                <section className="space-y-4">
                  <h4 className="text-[#666] text-xs font-bold uppercase tracking-widest">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Lactose'].map(item => (
                      <button key={item} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-white/60 text-xs font-medium">
                        {item}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Cuisine Preference */}
                <section className="space-y-4">
                  <h4 className="text-[#666] text-xs font-bold uppercase tracking-widest">Cuisine Preference</h4>
                  <div className="flex flex-wrap gap-2">
                    {['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Maharashtrian', 'Rajasthani', 'Punjabi', 'Kerala', 'Street Food'].map(item => (
                      <button key={item} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-white/60 text-xs font-medium">
                        {item}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Health Goal */}
                <section className="space-y-4">
                  <h4 className="text-[#666] text-xs font-bold uppercase tracking-widest">Health Goal</h4>
                  <div className="space-y-2">
                    {['Weight Loss', 'Weight Gain', 'Maintain', 'Muscle Building', 'Diabetes Friendly', 'Heart Healthy'].map(goal => (
                      <button key={goal} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-white/60 text-sm">
                        {goal}
                        <div className="w-5 h-5 rounded-full border border-white/10" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={() => setIsPreferenceOpen(false)}
                  className="w-full h-14 accent-gradient rounded-2xl text-black font-bold shadow-lg"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
