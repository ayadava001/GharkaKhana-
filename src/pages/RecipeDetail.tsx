import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Heart, Clock, Users, Flame, Star, 
  CheckCircle2, Play, X, Timer, Volume2, VolumeX, Info, ShoppingBag, Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Recipe } from '../services/geminiService';
import { useAppStore } from '../store';

const sampleRecipe: Recipe = {
  id: "sample-1",
  name_hindi: "Aloo Pyaaz Ki Sabzi",
  name_english: "Potato Onion Stir Fry",
  emoji: "🥘",
  description: "Bilkul simple ghar ki sabzi jo sirf pyaaz aur aloo se banti hai. Roti ke saath swaad aa jayega!",
  cuisine: "North Indian",
  meal_type: "Lunch/Dinner",
  diet_type: "Veg",
  difficulty: "Easy",
  prep_time_minutes: 10,
  cook_time_minutes: 15,
  total_time_minutes: 25,
  servings: 2,
  ingredients_match_percent: 90,
  calories_per_serving: 180,
  ingredients: [
    { item: "Aloo (Potato)", quantity: "3 medium", is_user_has: true, is_pantry_staple: false },
    { item: "Pyaaz (Onion)", quantity: "2 large", is_user_has: true, is_pantry_staple: false },
    { item: "Hari Mirch (Green Chili)", quantity: "2 pieces", is_user_has: true, is_pantry_staple: false },
    { item: "Haldi (Turmeric)", quantity: "1/2 tsp", is_user_has: false, is_pantry_staple: true },
    { item: "Jeera (Cumin)", quantity: "1 tsp", is_user_has: false, is_pantry_staple: true },
    { item: "Dhaniya Powder", quantity: "1 tsp", is_user_has: true, is_pantry_staple: false }
  ],
  missing_ingredients: ["Dhaniya patti (optional)"],
  steps: [
    { 
      step_number: 1, 
      instruction: "Aloo ko peel karke medium cubes mein kaat lo aur pyaaz ko lamba lamba slice kar lo.", 
      time_minutes: 5,
      pro_tip: "Aloo ko kaatne ke baad paani mein bhigo do taaki woh kaale na padein."
    },
    { 
      step_number: 2, 
      instruction: "Kadhai mein 2 chamach tel garam karo. Jab tel garam ho jaye, jeera daalo.", 
      time_minutes: 2,
      pro_tip: "Jeera jab tadakne lage (crackle), tabhi aage ka kaam shuru karo."
    },
    { 
      step_number: 3, 
      instruction: "Ab pyaaz aur hari mirch daalo. Pyaaz ko halka gulabi (light pink) hone tak bhuno.", 
      time_minutes: 5,
      pro_tip: null
    }
  ],
  nutrition: {
    calories: 180,
    protein_g: 4,
    carbs_g: 28,
    fat_g: 7,
    fiber_g: 3
  },
  tags: ["quick", "easy", "everyday"],
  serving_suggestion: "Garam roti ya paratha ke saath serve karo.",
  image: "https://picsum.photos/seed/aloopyaaz/800/600"
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addMealToPlan, addGroceryItem } = useAppStore();
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [currentCookingStep, setCurrentCookingStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });
  
  const headerOpacity = useTransform(scrollY, [100, 200], [0, 1]);
  const heroScale = useTransform(scrollY, [-100, 0, 100], [1.2, 1, 0.8]);
  const heroY = useTransform(scrollY, [0, 280], [0, 100]);

  const recipe = (location.state?.recipe as Recipe) || sampleRecipe;

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto bg-primary-bg pb-32 hide-scrollbar">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg"
          >
            <Heart size={18} className={cn(isFavorite && "fill-red-500 text-red-500")} />
          </button>
        </div>
      </header>

      {/* STICKY HEADER TITLE (Visible on scroll) */}
      <motion.div 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-40 bg-primary-bg/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-center px-20"
      >
        <h2 className="text-white font-display font-bold truncate text-sm">{recipe.name_english}</h2>
      </motion.div>

      {/* HERO SECTION */}
      <motion.div 
        style={{ scale: heroScale, y: heroY }}
        className="relative h-[280px] w-full flex items-center justify-center bg-gradient-to-b from-[#1A1A1A] to-primary-bg overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        <img 
          src={recipe.image} 
          alt={recipe.name_english} 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-bg to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl relative z-10">{recipe.emoji}</span>
        </div>
      </motion.div>

      {/* RECIPE INFO */}
      <div className="px-5 relative z-10 -mt-6">
        <h1 className="text-white text-[26px] font-display font-bold mb-1 leading-tight">{recipe.name_hindi}</h1>
        <h2 className="text-white/60 text-lg font-medium mb-4">{recipe.name_english}</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: recipe.diet_type, color: recipe.diet_type.toLowerCase() === 'veg' ? 'text-success' : 'text-warning', icon: '🟢' },
            { label: `${recipe.total_time_minutes} min`, icon: <Clock size={12} /> },
            { label: `${recipe.servings} servings`, icon: <Users size={12} /> },
            { label: `${recipe.calories_per_serving} cal`, icon: <Flame size={12} /> },
            { label: `4.5 rating`, icon: <Star size={12} className="fill-white/80" /> },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[12px] text-white/80">
              <span className={badge.color}>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[#CCC] text-[15px] leading-[1.7] mb-8 italic">
          "{recipe.description}"
        </p>

        {/* TABS */}
        <div className="sticky top-16 z-30 bg-primary-bg/95 backdrop-blur-md -mx-5 px-5 border-b border-white/5 mb-8">
          <div className="flex justify-between">
            {['Ingredients', 'Steps', 'Nutrition'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-4 text-sm font-medium transition-all relative",
                  activeTab === tab ? "text-white" : "text-[#666]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabDetail"
                    className="absolute bottom-0 left-0 right-0 h-0.5 accent-gradient" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === 'Ingredients' && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-white text-lg font-display font-bold mb-4">Samaan (Ingredients) 🧺</h3>
                <div className="space-y-4">
                  {recipe.ingredients.map((ing, i) => {
                    const available = ing.is_user_has || ing.is_pantry_staple;
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleIngredient(ing.item)}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all",
                            checkedIngredients.includes(ing.item) ? "bg-white border-white" : "border-white/20"
                          )}>
                            {checkedIngredients.includes(ing.item) && <CheckCircle2 size={14} className="text-black" />}
                          </div>
                          <div>
                            <p className={cn(
                              "text-[15px] transition-all",
                              checkedIngredients.includes(ing.item) ? "text-[#666] line-through" : "text-white"
                            )}>
                              {ing.item}
                            </p>
                            <p className="text-[#666] text-xs">{ing.quantity}</p>
                          </div>
                        </div>
                        {available && !checkedIngredients.includes(ing.item) && (
                          <span className="text-success text-[10px] font-bold uppercase tracking-widest bg-success/10 px-2 py-1 rounded">available ✓</span>
                        )}
                        {!available && !checkedIngredients.includes(ing.item) && (
                          <span className="text-warning text-[10px] font-bold uppercase tracking-widest bg-warning/10 px-2 py-1 rounded">need to buy</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {recipe.missing_ingredients.length > 0 && (
                <div className="p-5 rounded-2xl bg-warning/5 border border-warning/10">
                  <h4 className="text-warning text-sm font-bold mb-3 flex items-center gap-2">
                    🛒 Yeh kharidna padega:
                  </h4>
                  <div className="space-y-2 mb-4">
                    {recipe.missing_ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                        {ing}
                      </div>
                    ))}
                  </div>
                  <button className="w-full h-11 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <ShoppingBag size={14} />
                    Blinkit pe Order Karo
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Steps' && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <h3 className="text-white text-lg font-display font-bold mb-4">Kaise Banayein? 👨‍🍳</h3>
              <div className="relative space-y-8">
                <div className="absolute left-[14px] top-4 bottom-4 w-[1px] bg-[#333]" />
                {recipe.steps.map((step, i) => (
                  <div key={i} className="relative pl-12">
                    <button 
                      onClick={() => toggleStep(i)}
                      className={cn(
                        "absolute left-0 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10",
                        completedSteps.includes(i) ? "bg-white border-white" : "bg-primary-bg border-white/20"
                      )}
                    >
                      <span className={cn(
                        "text-[12px] font-bold",
                        completedSteps.includes(i) ? "text-black" : "text-white"
                      )}>{step.step_number}</span>
                    </button>
                    
                    <div className="space-y-3">
                      <p className={cn(
                        "text-[15px] leading-relaxed transition-all",
                        completedSteps.includes(i) ? "text-[#666]" : "text-white"
                      )}>
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-2 text-[#666] text-xs">
                        <Clock size={12} />
                        {step.time_minutes} min
                      </div>
                      {step.pro_tip && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-secondary-text italic flex gap-2">
                          <span>💡</span>
                          <p>AI Tip: {step.pro_tip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Nutrition' && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              <h3 className="text-white text-lg font-display font-bold mb-6">Nutrition Info 📊</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Calories", value: recipe.nutrition.calories, unit: "kcal", percent: 60 },
                  { label: "Protein", value: recipe.nutrition.protein_g, unit: "g", percent: 40 },
                  { label: "Carbs", value: recipe.nutrition.carbs_g, unit: "g", percent: 75 },
                  { label: "Fat", value: recipe.nutrition.fat_g, unit: "g", percent: 30 },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="36" fill="transparent" stroke="#1E1E1E" strokeWidth="6" />
                        <motion.circle 
                          cx="40" cy="40" r="36" fill="transparent" stroke="url(#gradient)" strokeWidth="6" 
                          strokeDasharray={226}
                          initial={{ strokeDashoffset: 226 }}
                          whileInView={{ strokeDashoffset: 226 - (226 * item.percent) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="100%" stopColor="#C0C0C0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-sm">{item.value}</span>
                        <span className="text-[10px] text-[#666]">{item.unit}</span>
                      </div>
                    </div>
                    <span className="text-secondary-text text-xs uppercase font-bold tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-white text-sm font-bold mb-4">Chef's Serving Suggestion</h4>
                <p className="text-white/60 text-xs leading-relaxed italic">
                  "{recipe.serving_suggestion}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM ACTIONS */}
        <div className="mt-12 flex gap-3">
          <button 
            onClick={() => {
              recipe.ingredients.forEach(ing => {
                if (!ing.is_user_has && !ing.is_pantry_staple) {
                  addGroceryItem({
                    name: ing.item,
                    quantity: ing.quantity,
                    category: recipe.name_english
                  });
                }
              });
              navigate('/grocery-list');
            }}
            className="flex-1 h-14 rounded-xl border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Grocery List
          </button>
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              addMealToPlan(today, 'dinner', recipe);
              navigate('/meal-plan');
            }}
            className="flex-1 h-14 rounded-xl accent-gradient text-black font-bold text-sm flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            Meal Plan
          </button>
        </div>
      </div>

      {/* FLOATING START COOKING BUTTON */}
      <div className="fixed bottom-24 left-0 right-0 px-5 z-40 pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCookingMode(true)}
          className="w-full h-14 rounded-full bg-white text-black font-display font-bold text-base flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(255,255,255,0.2)] pointer-events-auto"
        >
          <Play size={20} fill="black" />
          👨‍🍳 Cooking Mode Start
        </motion.button>
      </div>

      {/* COOKING MODE OVERLAY */}
      <AnimatePresence>
        {isCookingMode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-primary-bg flex flex-col"
          >
            <header className="px-5 py-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-black">
                  <Play size={16} fill="black" />
                </div>
                <h2 className="text-white font-display font-bold">Cooking Mode</h2>
              </div>
              <button 
                onClick={() => setIsCookingMode(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 px-8 flex flex-col justify-center text-center">
              <span className="text-secondary-text text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Step {currentCookingStep + 1} of {recipe.steps.length}
              </span>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCookingStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <p className="text-white text-[22px] font-display font-medium leading-relaxed">
                    {recipe.steps[currentCookingStep].instruction}
                  </p>
                  
                  {recipe.steps[currentCookingStep].pro_tip && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 max-w-sm mx-auto">
                      <p className="text-white/60 text-sm italic">
                        <span className="text-white font-bold not-italic mr-1">Pro Tip:</span>
                        {recipe.steps[currentCookingStep].pro_tip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-6 mt-12">
                <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <VolumeX size={24} />
                </button>
                <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <Timer size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 flex gap-4">
              <button 
                disabled={currentCookingStep === 0}
                onClick={() => setCurrentCookingStep(prev => prev - 1)}
                className="flex-1 h-16 rounded-2xl border border-white/10 text-white font-bold disabled:opacity-20"
              >
                Piche
              </button>
              <button 
                onClick={() => {
                  if (currentCookingStep < recipe.steps.length - 1) {
                    setCurrentCookingStep(prev => prev + 1);
                  } else {
                    setIsCookingMode(false);
                  }
                }}
                className="flex-[2] h-16 rounded-2xl accent-gradient text-black font-bold text-lg"
              >
                {currentCookingStep === recipe.steps.length - 1 ? "Khatam! 🎉" : "Agla Step →"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
