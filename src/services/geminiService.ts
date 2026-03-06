import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface Recipe {
  id: string;
  name_hindi: string;
  name_english: string;
  emoji: string;
  description: string;
  cuisine: string;
  meal_type: string;
  diet_type: string;
  difficulty: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  ingredients_match_percent: number;
  calories_per_serving: number;
  ingredients: {
    item: string;
    quantity: string;
    is_user_has: boolean;
    is_pantry_staple: boolean;
  }[];
  missing_ingredients: string[];
  steps: {
    step_number: number;
    instruction: string;
    time_minutes: number;
    pro_tip: string | null;
  }[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  tags: string[];
  serving_suggestion: string;
  image?: string;
}

export interface MealPlanDay {
  breakfast: { recipe_name: string; emoji: string; calories: number };
  lunch: { recipe_name: string; emoji: string; calories: number };
  snack: { recipe_name: string; emoji: string; calories: number };
  dinner: { recipe_name: string; emoji: string; calories: number };
  daily_total_calories: number;
}

export interface MealPlanResponse {
  meal_plan: {
    monday: MealPlanDay;
    tuesday: MealPlanDay;
    wednesday: MealPlanDay;
    thursday: MealPlanDay;
    friday: MealPlanDay;
    saturday: MealPlanDay;
    sunday: MealPlanDay;
  };
  weekly_grocery_list: { item: string; quantity: string; estimated_price: string }[];
  weekly_total_cost_estimate: string;
  chef_note: string;
}

const SYSTEM_INSTRUCTION = `You are "GharKaKhana AI Chef" — an expert Indian home cooking assistant.

## YOUR IDENTITY
- Name: Chef GK (GharKaKhana)
- Personality: Warm, encouraging, like a loving Indian mother who knows every recipe. Mix Hindi and English naturally (Hinglish).
- Tone: Friendly, practical, never judgmental about skill level
- You ONLY discuss cooking, recipes, meal planning, nutrition, and Indian food culture. Politely decline other topics.

## YOUR CORE FUNCTION
When given a list of ingredients available at home, you suggest authentic Indian recipes that can be made using ONLY those ingredients (plus basic pantry staples that every Indian kitchen has).

## BASIC PANTRY STAPLES (assume always available):
Namak (Salt), Pani (Water), Tel (Oil — any), Haldi (Turmeric), Lal Mirch Powder (Red Chili), Kali Mirch (Black Pepper), Cheeni (Sugar)

## RULES FOR RECIPE GENERATION
1. ALWAYS prioritize recipes that use MAXIMUM user ingredients and MINIMUM extra ingredients
2. Sort by ingredient_match_percent (highest first)
3. Include a MIX: at least 1 quick recipe (<15 min), 1 main course, 1 snack/side dish
4. Give 5 recipes for free users, up to 15 for premium
5. Every recipe MUST be authentic Indian — no western fusion unless specifically asked
6. Include regional variety when possible (don't just give North Indian every time)
7. ALWAYS use Hinglish in descriptions and steps (Hindi words written in English)
8. Measurements should be in Indian style: "2 chamach" (tablespoons), "1 katori" (bowl), "chutki bhar" (pinch) — along with standard measurements
9. Steps should be DETAILED enough for a beginner
10. Include pro_tips for at least 2-3 steps per recipe

## WHAT YOU MUST NEVER DO
- Never suggest raw meat consumption
- Never suggest alcohol-based recipes unless asked
- Never give medical/health advice beyond basic nutrition
- Never respond to non-food topics
- Never make up nutritional values — if unsure, give approximate ranges with disclaimer
- Never suggest recipes requiring expensive/imported ingredients unless user specifically has them`;

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name_hindi: { type: Type.STRING },
          name_english: { type: Type.STRING },
          emoji: { type: Type.STRING },
          description: { type: Type.STRING },
          cuisine: { type: Type.STRING },
          meal_type: { type: Type.STRING },
          diet_type: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          prep_time_minutes: { type: Type.NUMBER },
          cook_time_minutes: { type: Type.NUMBER },
          total_time_minutes: { type: Type.NUMBER },
          servings: { type: Type.NUMBER },
          ingredients_match_percent: { type: Type.NUMBER },
          calories_per_serving: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                quantity: { type: Type.STRING },
                is_user_has: { type: Type.BOOLEAN },
                is_pantry_staple: { type: Type.BOOLEAN }
              },
              required: ["item", "quantity", "is_user_has", "is_pantry_staple"]
            }
          },
          missing_ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step_number: { type: Type.NUMBER },
                instruction: { type: Type.STRING },
                time_minutes: { type: Type.NUMBER },
                pro_tip: { type: Type.STRING, nullable: true }
              },
              required: ["step_number", "instruction", "time_minutes"]
            }
          },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein_g: { type: Type.NUMBER },
              carbs_g: { type: Type.NUMBER },
              fat_g: { type: Type.NUMBER },
              fiber_g: { type: Type.NUMBER }
            },
            required: ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g"]
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          serving_suggestion: { type: Type.STRING }
        },
        required: [
          "id", "name_hindi", "name_english", "emoji", "description", 
          "cuisine", "meal_type", "diet_type", "difficulty", 
          "prep_time_minutes", "cook_time_minutes", "total_time_minutes", 
          "servings", "ingredients_match_percent", "calories_per_serving", 
          "ingredients", "missing_ingredients", "steps", "nutrition", 
          "tags", "serving_suggestion"
        ]
      }
    },
    chef_message: { type: Type.STRING },
    daily_tip: { type: Type.STRING }
  },
  required: ["recipes", "chef_message", "daily_tip"]
};

export interface RecipeGenerationParams {
  ingredients: string[];
  diet: string;
  mealType: string;
  cuisine: string;
  maxTime: string;
  familySize: number;
  healthGoal: string;
  isPremium: boolean;
}

export async function generateWeeklyPlan(params: { ingredients: string[], diet: string, healthGoal: string }): Promise<MealPlanResponse> {
  const prompt = `Generate a 7-day Indian meal plan.
  User has: ${params.ingredients.join(", ")}
  Diet: ${params.diet}
  Goal: ${params.healthGoal}
  
  For each day (Monday to Sunday), provide Breakfast, Lunch, Snack, and Dinner.
  Also provide a weekly grocery list of items NOT in the user's list.
  
  Response MUST be in the exact JSON format matching the MealPlanResponse interface.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
}

export async function generateRecipes(params: RecipeGenerationParams): Promise<{ recipes: Recipe[], chefMessage: string, dailyTip: string }> {
  if (!params.ingredients.length) return { recipes: [], chefMessage: "", dailyTip: "" };

  const prompt = `Mere paas yeh ingredients hain:
${params.ingredients.join(", ")}

Preferences:
- Diet: ${params.diet}
- Meal type: ${params.mealType}
- Cuisine: ${params.cuisine}
- Max cooking time: ${params.maxTime}
- Family size: ${params.familySize} logon ke liye
- Health goal: ${params.healthGoal}

In ingredients se ${params.isPremium ? 15 : 5} authentic Indian recipes suggest karo.

Response MUST be in the exact JSON format as defined in your system instructions. No extra text outside JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    const recipes = data.recipes.map((r: any) => ({
      ...r,
      image: `https://picsum.photos/seed/${r.name_english.replace(/\s/g, '')}/800/600`
    }));

    return {
      recipes,
      chefMessage: data.chef_message,
      dailyTip: data.daily_tip
    };
  } catch (error) {
    console.error("Error generating recipes:", error);
    return { recipes: [], chefMessage: "Maaf karna beta, kuch gadbad ho gayi. Phir se try karo!", dailyTip: "" };
  }
}
