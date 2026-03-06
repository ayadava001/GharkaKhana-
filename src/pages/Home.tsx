import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, ChefHat, Calendar, ShoppingBasket, Crown, Clock, Star, Leaf, Flame, RefreshCcw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const categories = [
  { name: 'Nashta', emoji: '🍳', path: '/recipes?cat=breakfast' },
  { name: 'Lunch Recipes', emoji: '🍛', path: '/recipes?cat=lunch' },
  { name: 'Dinner Special', emoji: '🌙', path: '/recipes?cat=dinner' },
  { name: 'Snacks & Chai', emoji: '🍪', path: '/recipes?cat=snacks' },
  { name: 'Drinks & Shakes', emoji: '🥤', path: '/recipes?cat=drinks' },
  { name: 'Party & Festival', emoji: '🎉', path: '/recipes?cat=party' },
  { name: 'Healthy & Diet', emoji: '💪', path: '/recipes?cat=healthy' },
  { name: 'Quick 15-min', emoji: '⚡', path: '/recipes?cat=quick' },
];

const suggestions = [
  { id: '1', name: 'Dal Tadka', time: '25 min', type: 'Veg', emoji: '🍛' },
  { id: '2', name: 'Chole Bhature', time: '40 min', type: 'Veg', emoji: '🥘' },
  { id: '3', name: 'Rajma Chawal', time: '35 min', type: 'Veg', emoji: '🍲' },
  { id: '4', name: 'Paneer Butter Masala', time: '30 min', type: 'Veg', emoji: '🫕' },
  { id: '5', name: 'Aloo Gobi', time: '20 min', type: 'Veg', emoji: '🥗' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* SECTION 1: TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-primary-bg/80 backdrop-blur-xl border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-secondary-text text-sm font-medium">Namaste! 👋</p>
          <h1 className="text-white text-[22px] font-display font-bold leading-tight">Aaj kya banayein?</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="relative mb-1">
            <Bell size={24} className="text-white" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary-bg" />
          </div>
          <span className="text-[#666] text-[11px] font-hindi">शुक्रवार, 27 जून</span>
        </div>
      </header>

      {/* Main Content Area */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-24 px-5 space-y-8"
      >
        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div className="flex justify-center py-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCcw size={20} className="text-white/40" />
            </motion.div>
          </div>
        )}

        {/* SECTION 2: QUICK ACTION CARDS */}
        <motion.section 
          variants={itemVariants}
          className="grid grid-cols-1 gap-4"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="p-6 rounded-[20px] bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] border border-white/10 shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 accent-gradient blur-[80px] opacity-10" />
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium mb-4">
                ⚡ Quick Recipe
              </span>
              <h2 className="text-white text-xl font-display font-bold mb-1">Ingredients daalo, Recipe pao!</h2>
              <p className="text-[#999] text-sm mb-6">Jo ghar mein hai ussi se banao kuch tasty</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/cook-now')}
                className="w-full h-11 accent-gradient rounded-radius-button text-[#0A0A0A] font-display font-semibold text-sm flex items-center justify-center gap-2"
              >
                Start Cooking →
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/grocery-list')}
            className="p-5 rounded-[20px] bg-[#141414] border border-white/5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🛒
              </div>
              <div>
                <h3 className="text-white font-bold text-[15px]">Grocery List</h3>
                <p className="text-secondary-text text-xs">Is hafte ka samaan check karo</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <ChevronRight size={18} />
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 3: TODAY'S MEAL SUGGESTIONS */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-display font-semibold">Aaj Ke Liye Suggestions 🍽️</h2>
            <button onClick={() => navigate('/recipes')} className="text-[#666] text-[13px] font-medium">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
            {suggestions.map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/recipe/${item.id}`)}
                className="flex-shrink-0 w-40 h-[200px] bg-secondary-bg border border-white/5 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="flex-1 bg-gradient-to-br from-[#1E1E1E] to-[#141414] flex items-center justify-center relative group">
                  <span className="text-5xl transition-transform group-hover:scale-110 duration-300">{item.emoji}</span>
                  <div className="absolute inset-0 shimmer opacity-20" />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold truncate mb-1">{item.name}</h3>
                  <p className="text-[#666] text-[11px]">⏱ {item.time} · 🟢 {item.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 4: CATEGORIES GRID */}
        <motion.section variants={itemVariants}>
          <h2 className="text-white text-lg font-display font-semibold mb-4">Categories Explore Karo 🔍</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(cat.path)}
                className="h-20 bg-secondary-bg border border-white/5 rounded-2xl flex items-center px-4 gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-white text-sm font-medium text-left leading-tight">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* SECTION 5: DAILY NUTRITION TIP */}
        <motion.section variants={itemVariants}>
          <div className="p-4 bg-secondary-bg rounded-2xl border border-white/5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold mb-1">Aaj Ka Nutrition Tip</h3>
              <p className="text-[#CCC] text-sm leading-relaxed">
                Haldi wala doodh raat ko peene se immunity 3x badhti hai aur neend bhi acchi aati hai.
              </p>
            </div>
          </div>
        </motion.section>

        {/* SECTION 6: PREMIUM UPSELL BANNER */}
        <motion.section variants={itemVariants}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 accent-gradient blur-[60px] opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-white" />
                <h3 className="text-white text-lg font-display font-bold">GharKaKhana Premium</h3>
              </div>
              <p className="text-[#999] text-sm mb-6 leading-relaxed">
                Unlimited recipes, weekly meal plans, nutrition tracking, aur grocery lists — sirf ₹99/month
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/premium')}
                className="h-11 px-6 rounded-radius-button border border-white text-white font-display font-semibold text-sm hover:bg-white hover:text-black transition-all"
              >
                Upgrade Now
              </motion.button>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
