import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe } from './services/geminiService';

export type DietType = 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Vegan' | 'Jain' | 'Both';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  price?: number;
  recipeId?: string;
}

export interface MealPlanEntry {
  recipe: Recipe;
  cooked: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  diet_preference: DietType;
  is_premium: boolean;
  family_size: number;
  health_goal: string;
}

interface AppState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  dietPreference: DietType | null;
  setDietPreference: (pref: DietType) => void;
  userIngredients: string[];
  setUserIngredients: (ingredients: string[]) => void;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  
  // AI State
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  dailyApiCalls: number;
  incrementDailyApiCalls: () => void;
  lastApiCallDate: string | null;
  
  // Auth State
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  // Meal Plan
  mealPlan: Record<string, MealPlanEntry>; // key: YYYY-MM-DD-mealType
  addMealToPlan: (date: string, type: string, recipe: Recipe) => void;
  removeMealFromPlan: (date: string, type: string) => void;
  toggleMealCooked: (date: string, type: string) => void;
  setWeeklyPlan: (plan: Record<string, MealPlanEntry>) => void;

  // Grocery List
  groceryList: GroceryItem[];
  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  toggleGroceryItem: (id: string) => void;
  removeGroceryItem: (id: string) => void;
  clearCheckedItems: () => void;
  clearGroceryList: () => void;
  addMissingIngredientsFromRecipe: (recipe: Recipe) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
      dietPreference: null,
      setDietPreference: (pref) => set({ dietPreference: pref }),
      userIngredients: [],
      setUserIngredients: (ingredients) => set({ userIngredients: ingredients }),
      addIngredient: (ingredient) => 
        set((state) => ({ 
          userIngredients: state.userIngredients.includes(ingredient) 
            ? state.userIngredients 
            : [...state.userIngredients, ingredient] 
        })),
      removeIngredient: (ingredient) => 
        set((state) => ({ 
          userIngredients: state.userIngredients.filter((i) => i !== ingredient) 
        })),

      recipes: [],
      setRecipes: (recipes) => set({ recipes }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),
      dailyApiCalls: 0,
      lastApiCallDate: null,
      incrementDailyApiCalls: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastApiCallDate !== today) {
          return { dailyApiCalls: 1, lastApiCallDate: today };
        }
        return { dailyApiCalls: state.dailyApiCalls + 1 };
      }),

      user: null,
      setUser: (user) => set({ user }),

      mealPlan: {},
      addMealToPlan: (date, type, recipe) => set((state) => ({
        mealPlan: {
          ...state.mealPlan,
          [`${date}-${type}`]: { recipe, cooked: false }
        }
      })),
      removeMealFromPlan: (date, type) => set((state) => {
        const newPlan = { ...state.mealPlan };
        delete newPlan[`${date}-${type}`];
        return { mealPlan: newPlan };
      }),
      toggleMealCooked: (date, type) => set((state) => {
        const key = `${date}-${type}`;
        if (!state.mealPlan[key]) return state;
        return {
          mealPlan: {
            ...state.mealPlan,
            [key]: { ...state.mealPlan[key], cooked: !state.mealPlan[key].cooked }
          }
        };
      }),
      setWeeklyPlan: (plan) => set({ mealPlan: plan }),

      groceryList: [],
      addGroceryItem: (item) => set((state) => ({
        groceryList: [
          { ...item, id: Math.random().toString(36).substr(2, 9), checked: false },
          ...state.groceryList
        ]
      })),
      toggleGroceryItem: (id) => set((state) => ({
        groceryList: state.groceryList.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      })),
      removeGroceryItem: (id) => set((state) => ({
        groceryList: state.groceryList.filter((item) => item.id !== id)
      })),
      clearCheckedItems: () => set((state) => ({
        groceryList: state.groceryList.filter((item) => !item.checked)
      })),
      clearGroceryList: () => set({ groceryList: [] }),
      addMissingIngredientsFromRecipe: (recipe) => set((state) => {
        const missing = recipe.missing_ingredients.map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name,
          quantity: 'As needed',
          category: 'Recipe Missing',
          checked: false,
          recipeId: recipe.id
        }));
        
        const filteredMissing = missing.filter(m => 
          !state.groceryList.some(existing => existing.name.toLowerCase() === m.name.toLowerCase())
        );

        return {
          groceryList: [...filteredMissing, ...state.groceryList]
        };
      }),
    }),
    {
      name: 'gharkakhana-storage',
    }
  )
);
