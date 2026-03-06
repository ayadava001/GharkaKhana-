import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Mic, X, ChevronDown, ChevronUp, Check, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { INDIAN_INGREDIENTS, QUICK_ADD_INGREDIENTS } from '../constants/ingredients';
import { generateRecipes } from '../services/geminiService';

const loadingMessages = [
  "🍳 AI Chef soch raha hai...",
  "🧅 Ingredients check ho rahe hain...",
  "📖 Best recipes dhundh rahe hain...",
  "🎉 Almost ready!",
];

export default function CookNow() {
  const navigate = useNavigate();
  const { 
    userIngredients, addIngredient, removeIngredient, 
    setRecipes, setIsLoading, isLoading, setError, error,
    dailyApiCalls, incrementDailyApiCalls, user
  } = useAppStore();
  
  const [inputValue, setInputValue] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [mealType, setMealType] = useState('Any');
  const [cuisine, setCuisine] = useState('Any');
  const [maxTime, setMaxTime] = useState('Any');
  const [familySize, setFamilySize] = useState(2);
  const [healthGoal, setHealthGoal] = useState('None');
  const [toast, setToast] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const isPremium = user?.is_premium || false;
  const maxFreeSearches = 5;
  const remainingSearches = Math.max(0, maxFreeSearches - dailyApiCalls);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const filteredIngredients = INDIAN_INGREDIENTS.filter(item => 
    item.search.toLowerCase().includes(inputValue.toLowerCase()) &&
    !userIngredients.some(ing => ing.includes(item.name.split(' (')[0]))
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddIngredient = (name: string, emoji: string) => {
    if (userIngredients.length >= 15) {
      showToast("Maximum 15 ingredients allowed!");
      return;
    }
    const ingredientString = `${emoji} ${name}`;
    if (!userIngredients.includes(ingredientString)) {
      addIngredient(ingredientString);
      setInputValue('');
      setShowAutocomplete(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFindRecipes = async () => {
    if (userIngredients.length === 0) {
      showToast("Pehle ingredients add karo! 🧅");
      return;
    }

    if (!isPremium && dailyApiCalls >= maxFreeSearches) {
      showToast("Aaj ke free requests khatam ho gaye. Premium le lo! 👑");
      navigate('/premium');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateRecipes({
        ingredients: userIngredients,
        diet: 'Both', // Should be from user profile/state
        mealType,
        cuisine,
        maxTime,
        familySize,
        healthGoal,
        isPremium
      });

      if (result.recipes.length === 0) {
        throw new Error("No recipes found");
      }

      setRecipes(result.recipes);
      incrementDailyApiCalls();
      
      // Cache results
      localStorage.setItem('lastRecipes', JSON.stringify({
        recipes: result.recipes,
        timestamp: Date.now()
      }));

      navigate('/recipes', { state: { chefMessage: result.chefMessage, dailyTip: result.dailyTip } });
    } catch (err) {
      console.error(err);
      setError("AI Chef thoda busy hai, phir try karo! 🙏");
      showToast("AI Chef thoda busy hai, phir try karo! 🙏");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <button onClick={() => navigate('/home')} className="mb-4 text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-[22px] font-display font-bold">Kya hai ghar mein? 🧅</h1>
        <p className="text-secondary-text text-sm">Ingredients add karo, AI recipe suggest karega</p>
      </header>

      <main className="px-5 space-y-8">
        {/* SECTION 1: INGREDIENT INPUT AREA */}
        <section className="space-y-4">
          <div className="relative" ref={autocompleteRef}>
            <div className={cn(
              "flex items-center h-[52px] bg-[#1E1E1E] border rounded-[14px] px-4 transition-all",
              showAutocomplete ? "border-white/20 ring-1 ring-white/10" : "border-white/10"
            )}>
              <Search size={20} className="text-secondary-text mr-3" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowAutocomplete(e.target.value.length > 0);
                }}
                onFocus={() => inputValue.length > 0 && setShowAutocomplete(true)}
                placeholder="Type ingredient... (e.g., pyaaz, tamatar)"
                className="flex-1 bg-transparent text-white text-[15px] placeholder:text-[#666] outline-none"
              />
              <Mic size={20} className="text-secondary-text ml-3" />
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showAutocomplete && filteredIngredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-white/10 rounded-xl overflow-hidden z-40 shadow-2xl"
                >
                  {filteredIngredients.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddIngredient(item.name.split(' (')[0], item.emoji)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-white text-sm">{item.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ingredient Chips Area */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {userIngredients.map((ing) => (
                <motion.div
                  key={ing}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-3.5 py-2"
                >
                  <span className="text-sm text-white">{ing}</span>
                  <button 
                    onClick={() => removeIngredient(ing)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {userIngredients.length > 12 && (
            <p className="text-warning text-[11px] font-medium">Zyada ingredients = zyada options!</p>
          )}
        </section>

        {/* SECTION 2: QUICK ADD BUTTONS */}
        <section className="space-y-4">
          <h2 className="text-[#999] text-[15px] font-semibold">Jaldi Add Karo ⚡</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ADD_INGREDIENTS.map((item, i) => {
              const isAdded = userIngredients.some(ing => ing.includes(item.name));
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isAdded && handleAddIngredient(item.name, item.emoji)}
                  className={cn(
                    "h-11 flex items-center justify-center gap-2 rounded-xl border transition-all",
                    isAdded 
                      ? "bg-white/5 border-white/5 text-white/30" 
                      : "bg-[#141414] border-white/5 text-white hover:border-white/20"
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                  {isAdded && <Check size={12} />}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: COOKING PREFERENCES */}
        <section className="border-t border-white/5 pt-6">
          <button 
            onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
            className="w-full flex items-center justify-between text-white"
          >
            <span className="text-[15px] font-semibold">Preferences (Optional) ⚙️</span>
            {isPreferencesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          <AnimatePresence>
            {isPreferencesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-6 space-y-8">
                  <div className="space-y-3">
                    <p className="text-[#666] text-xs font-bold uppercase tracking-wider">Meal Type</p>
                    <div className="flex flex-wrap gap-2">
                      {['Any', 'Nashta', 'Lunch', 'Dinner', 'Snack'].map(type => (
                        <button 
                          key={type} 
                          onClick={() => setMealType(type)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                            mealType === type ? "accent-gradient text-black border-transparent" : "border-white/10 text-white/60"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#666] text-xs font-bold uppercase tracking-wider">Cuisine</p>
                    <div className="flex flex-wrap gap-2">
                      {['Any', 'North Indian', 'South Indian', 'Bengali', 'Punjabi'].map(type => (
                        <button 
                          key={type} 
                          onClick={() => setCuisine(type)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                            cuisine === type ? "accent-gradient text-black border-transparent" : "border-white/10 text-white/60"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#666] text-xs font-bold uppercase tracking-wider">Max Cooking Time</p>
                    <div className="flex flex-wrap gap-2">
                      {['Any', '15 min', '30 min', '45 min', '1 hour'].map(time => (
                        <button 
                          key={time} 
                          onClick={() => setMaxTime(time)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                            maxTime === time ? "accent-gradient text-black border-transparent" : "border-white/10 text-white/60"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#666] text-xs font-bold uppercase tracking-wider">Family Size ({familySize} logon ke liye)</p>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={familySize}
                        onChange={(e) => setFamilySize(parseInt(e.target.value))}
                        className="flex-1 accent-white"
                      />
                      <span className="text-white font-bold w-8">{familySize}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#666] text-xs font-bold uppercase tracking-wider">Health Goal</p>
                    <div className="flex flex-wrap gap-2">
                      {['None', 'Weight Loss', 'Weight Gain', 'Muscle Building', 'Diabetes Friendly'].map(goal => (
                        <button 
                          key={goal} 
                          onClick={() => setHealthGoal(goal)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                            healthGoal === goal ? "accent-gradient text-black border-transparent" : "border-white/10 text-white/60"
                          )}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* SECTION 4: THE BIG "FIND RECIPES" BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-bg/95 backdrop-blur-xl border-t border-white/5 p-5 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex flex-col">
              <span className="text-[#999] text-[13px] font-medium">{userIngredients.length} ingredients added</span>
              {!isPremium && (
                <span className="text-secondary-text text-[10px]">🔍 Aaj ke searches: {remainingSearches}/{maxFreeSearches} baaki</span>
              )}
            </div>
            <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">AI Powered</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            animate={userIngredients.length > 0 ? { opacity: [0.95, 1, 0.95] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            disabled={userIngredients.length === 0 || isLoading}
            onClick={handleFindRecipes}
            className={cn(
              "w-full h-[54px] rounded-[14px] flex items-center justify-center text-[#0A0A0A] font-display font-semibold text-base transition-all",
              userIngredients.length === 0 
                ? "bg-white/10 text-white/20" 
                : "accent-gradient shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            )}
          >
            Recipe Dhundho! 🍳
          </motion.button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full accent-gradient flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                🥘
              </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-lg font-display font-bold mb-2"
              >
                {loadingMessages[loadingMessageIndex]}
              </motion.p>
            </AnimatePresence>
            
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mb-12">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full accent-gradient"
              />
            </div>

            <button 
              onClick={() => setIsLoading(false)}
              className="px-6 py-2 rounded-full border border-white/10 text-secondary-text text-sm font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-[#1E1E1E] border border-white/10 px-6 py-3 rounded-full text-white text-sm font-medium z-50 shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
