import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Star, Edit3, RefreshCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { generateRecipes, Recipe } from '../services/geminiService';

const filterTabs = ["All", "Quick (<20 min)", "Easy", "Popular", "Healthy"];

export default function Recipes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userIngredients, dietPreference, recipes, setRecipes, isLoading, setIsLoading, setError, error } = useAppStore();
  const [activeTab, setActiveTab] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [chefMessage, setChefMessage] = useState(location.state?.chefMessage || "");
  const [dailyTip, setDailyTip] = useState(location.state?.dailyTip || "");

  useEffect(() => {
    // Check cache if no recipes in state
    if (recipes.length === 0) {
      const cached = localStorage.getItem('lastRecipes');
      if (cached) {
        const { recipes: cachedRecipes, timestamp } = JSON.parse(cached);
        // 1 hour expiry
        if (Date.now() - timestamp < 3600000) {
          setRecipes(cachedRecipes);
        }
      }
    }
  }, [recipes.length, setRecipes]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredRecipes = recipes.filter(r => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Quick (<20 min)') return r.total_time_minutes <= 20;
    if (activeTab === 'Easy') return r.difficulty.toLowerCase() === 'easy';
    if (activeTab === 'Healthy') return r.tags.includes('healthy') || r.calories_per_serving < 300;
    return true;
  });

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 sticky top-0 bg-primary-bg/80 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/cook-now')} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-[22px] font-display font-bold">Yeh Bana Sakte Ho! 🎉</h1>
        </div>
        
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar">
            {userIngredients.map((ing, i) => (
              <div key={i} className="flex-shrink-0 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/60 whitespace-nowrap">
                {ing}
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/cook-now')}
            className="flex-shrink-0 flex items-center gap-1 text-white text-xs font-medium pl-2 border-l border-white/10"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
      </header>

      <main className="px-5 mt-6">
        {/* Chef Message */}
        {!isLoading && chefMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl relative"
          >
            <div className="absolute -top-3 -left-2 text-2xl">👩‍🍳</div>
            <p className="text-white text-sm italic leading-relaxed">"{chefMessage}"</p>
            {dailyTip && (
              <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                <span className="text-xs">💡</span>
                <p className="text-[#888] text-[11px] font-medium">Chef's Tip: {dailyTip}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-6 overflow-x-auto hide-scrollbar mb-8 border-b border-white/5">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-white" : "text-[#666]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 accent-gradient" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Recipes List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-secondary-bg rounded-[18px] p-4 h-48 shimmer" />
                ))}
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <Sparkles size={32} className="text-white/40" />
                  </motion.div>
                  <p className="text-white font-bold">Chef GK is crafting your recipes...</p>
                  <p className="text-secondary-text text-xs mt-1">Finding the perfect match for your pantry</p>
                </div>
              </motion.div>
            ) : filteredRecipes.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredRecipes.map((recipe, i) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}
                    className="bg-secondary-bg border border-white/5 rounded-[18px] overflow-hidden flex flex-col"
                  >
                    {/* Image Area */}
                    <div className="h-[180px] bg-gradient-to-br from-[#1E1E1E] to-[#141414] relative flex items-center justify-center">
                      <img 
                        src={recipe.image} 
                        alt={recipe.name_english} 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          recipe.difficulty.toLowerCase() === 'easy' ? "text-success" : "text-warning"
                        )}>
                          {recipe.difficulty}
                        </span>
                      </div>

                      <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          recipe.diet_type.toLowerCase() === 'veg' ? "bg-success" : "bg-warning"
                        )} />
                      </div>

                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Clock size={12} className="text-white/60" />
                        <span className="text-[11px] text-white font-medium">{recipe.total_time_minutes} min</span>
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{recipe.emoji}</span>
                          <h3 className="text-white text-[17px] font-display font-semibold">{recipe.name_english}</h3>
                        </div>
                        <p className="text-[#888] text-sm line-clamp-1">{recipe.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-[#666] text-xs">
                        <span className="flex items-center gap-1">🍽 {recipe.servings} servings</span>
                        <span className="flex items-center gap-1">🔥 {recipe.calories_per_serving} cal</span>
                        <span className="flex items-center gap-1 text-white/80"><Star size={12} className="fill-white/80" /> 4.5</span>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="flex-1 mr-6">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] text-[#888] font-medium">Ingredients Match</span>
                            <span className="text-[11px] text-white font-bold">{recipe.ingredients_match_percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${recipe.ingredients_match_percent}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full accent-gradient rounded-full" 
                            />
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => toggleFavorite(recipe.id, e)}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            favorites.includes(recipe.id) ? "bg-white/10 text-white" : "bg-white/5 text-[#666]"
                          )}
                        >
                          <Heart size={20} className={cn(favorites.includes(recipe.id) && "fill-white")} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <span className="text-6xl mb-6">😕</span>
                <h3 className="text-white text-xl font-display font-bold mb-2">Koi recipe nahi mili!</h3>
                <p className="text-secondary-text text-sm max-w-[240px] mb-8">Try adding more ingredients ya filters change karo</p>
                <button 
                  onClick={() => navigate('/cook-now')}
                  className="px-8 py-3 bg-white text-black font-display font-bold rounded-xl"
                >
                  Ingredients Edit Karo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
