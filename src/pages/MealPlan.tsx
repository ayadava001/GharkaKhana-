import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, ChevronLeft, ChevronRight, 
  Trash2, CheckCircle2, Sparkles, Search, X, 
  Clock, Flame, ArrowRight, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { generateWeeklyPlan, Recipe } from '../services/geminiService';

const mealTypes = [
  { id: 'breakfast', name: 'Nashta (Breakfast)', time: '7:00 - 9:00 AM', emoji: '☀️' },
  { id: 'lunch', name: 'Lunch', time: '12:00 - 2:00 PM', emoji: '🌤️' },
  { id: 'snack', name: 'Snack / Chai', time: '4:00 - 5:30 PM', emoji: '🌅' },
  { id: 'dinner', name: 'Dinner', time: '7:30 - 9:30 PM', emoji: '🌙' },
];

export default function MealPlan() {
  const navigate = useNavigate();
  const { 
    mealPlan, toggleMealCooked, removeMealFromPlan, addMealToPlan, 
    userIngredients, dietPreference, setWeeklyPlan, addGroceryItem
  } = useAppStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingMeal, setIsAddingMeal] = useState<{ type: string; date: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
  const selectedDateKey = formatDateKey(selectedDate);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await generateWeeklyPlan({
        ingredients: userIngredients,
        diet: dietPreference || 'Both',
        healthGoal: 'Maintain Weight'
      });

      // Convert response to store format
      const newPlan: any = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      weekDates.forEach((date, i) => {
        const dayKey = days[i];
        const dayData = (response.meal_plan as any)[dayKey];
        const dateStr = formatDateKey(date);

        if (dayData) {
          ['breakfast', 'lunch', 'snack', 'dinner'].forEach(type => {
            const meal = dayData[type];
            if (meal) {
              newPlan[`${dateStr}-${type}`] = {
                recipe: {
                  id: `ai-${dateStr}-${type}`,
                  name_english: meal.recipe_name,
                  emoji: meal.emoji,
                  calories_per_serving: meal.calories,
                  // Add other required fields with defaults
                  name_hindi: meal.recipe_name,
                  description: "AI Generated Meal",
                  cuisine: "Indian",
                  meal_type: type,
                  diet_type: dietPreference || "Veg",
                  difficulty: "Medium",
                  prep_time_minutes: 10,
                  cook_time_minutes: 20,
                  total_time_minutes: 30,
                  servings: 2,
                  ingredients_match_percent: 100,
                  ingredients: [],
                  missing_ingredients: [],
                  steps: [],
                  nutrition: { calories: meal.calories, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
                  tags: [],
                  serving_suggestion: ""
                },
                cooked: false
              };
            }
          });
        }
      });

      setWeeklyPlan(newPlan);

      // Add grocery items
      response.weekly_grocery_list.forEach(item => {
        addGroceryItem({
          name: item.item,
          quantity: item.quantity,
          category: 'Weekly Plan'
        });
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg pb-32">
      {/* HEADER */}
      <header className="px-5 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-[22px] font-display font-bold">Hafta Bhar Ka Plan 📅</h1>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-full border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 bg-white/5"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Se Plan Banao ✨
          </button>
        </div>
        <p className="text-secondary-text text-sm">Monday se Sunday, har meal planned</p>
      </header>

      {/* WEEK SELECTOR */}
      <div className="px-5 py-6 flex items-center gap-4">
        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 flex justify-between overflow-x-auto hide-scrollbar gap-3">
          {weekDates.map((date, i) => {
            const isSelected = formatDateKey(date) === selectedDateKey;
            const hasMeals = Object.keys(mealPlan).some(k => k.startsWith(formatDateKey(date)));
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all relative",
                  isSelected ? "bg-white text-black scale-105" : "bg-secondary-bg text-white"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase mb-1", isSelected ? "text-black/60" : "text-[#666]")}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-sm font-bold">{date.getDate()}</span>
                {hasMeals && (
                  <div className={cn("absolute bottom-1.5 w-1 h-1 rounded-full", isSelected ? "bg-black" : "accent-gradient")} />
                )}
              </button>
            );
          })}
        </div>
        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* MEAL SLOTS */}
      <main className="px-5 space-y-4">
        {mealTypes.map((type) => {
          const mealKey = `${selectedDateKey}-${type.id}`;
          const meal = mealPlan[mealKey];

          return (
            <div key={type.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-white text-sm font-semibold">{type.name}</span>
                </div>
                <span className="text-[#666] text-[11px] font-medium">{type.time}</span>
              </div>

              {meal ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "bg-secondary-bg border rounded-2xl p-4 flex items-center justify-between transition-all",
                    meal.cooked ? "border-success/20 opacity-60" : "border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4" onClick={() => navigate(`/recipe/${meal.recipe.id}`, { state: { recipe: meal.recipe } })}>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                      {meal.recipe.emoji}
                    </div>
                    <div>
                      <h4 className={cn("text-white font-bold text-[15px]", meal.cooked && "line-through")}>
                        {meal.recipe.name_english}
                      </h4>
                      <p className="text-[#666] text-xs">{meal.recipe.calories_per_serving} cal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleMealCooked(selectedDateKey, type.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        meal.cooked ? "bg-success text-black" : "bg-white/5 text-[#666]"
                      )}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => removeMealFromPlan(selectedDateKey, type.id)}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#666] hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setIsAddingMeal({ type: type.id, date: selectedDateKey })}
                  className="w-full h-20 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-1 text-[#666] hover:border-white/10 hover:text-white transition-all"
                >
                  <Plus size={20} />
                  <span className="text-xs font-medium">Add Recipe</span>
                </button>
              )}
            </div>
          );
        })}

        {/* DAILY SUMMARY */}
        <div className="mt-8 p-5 rounded-2xl bg-secondary-bg border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-sm font-bold">Daily Summary</span>
            <span className="text-[#666] text-xs">Target: 2,000 cal</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Cal', val: Object.values(mealPlan).filter(m => formatDateKey(new Date()) === selectedDateKey).reduce((acc, m) => acc + m.recipe.calories_per_serving, 0) },
              { label: 'Prot', val: '45g' },
              { label: 'Carb', val: '180g' },
              { label: 'Fat', val: '35g' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-bold text-sm">{stat.val}</p>
                <p className="text-[#666] text-[10px] uppercase font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-success w-[72%] rounded-full" />
          </div>
        </div>

        {/* AI AUTO PLAN */}
        <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={80} />
          </div>
          <h3 className="text-white font-display font-bold text-lg mb-2 flex items-center gap-2">
            🤖 AI Se Poora Hafta Plan Karo
          </h3>
          <p className="text-secondary-text text-sm mb-6 leading-relaxed">
            Apni diet preference, budget aur time ke hisaab se AI ek perfect weekly plan banayega
          </p>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full h-12 accent-gradient rounded-xl text-black font-bold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            {isGenerating && <Loader2 size={18} className="animate-spin" />}
            Generate Plan ✨
          </button>
        </div>
      </main>

      {/* GROCERY CHIP */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => navigate('/grocery-list')}
          className="px-6 py-3 rounded-full bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold flex items-center gap-2 shadow-2xl backdrop-blur-xl"
        >
          🛒 View Grocery List
        </button>
      </div>
    </div>
  );
}
