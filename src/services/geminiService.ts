import { Type } from "@google/genai";

/**
 * Helper to call server-side AI API
 */
async function callServerAI(payload: any) {
  console.log("Calling Server AI API...");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate content");
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("AI Chef thoda zyada time le raha hai. Phir se try karo!");
    }
    throw error;
  }
}

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

const SYSTEM_INSTRUCTION = `You are "GharKaKhana AI Chef" (Chef GK). Warm, encouraging Indian mother tone. Mix Hindi-English (Hinglish).
Only discuss Indian cooking, recipes, meal planning, and nutrition.

Assume these staples are ALWAYS available: Salt, Water, Oil, Turmeric, Red Chili Powder, Black Pepper, Sugar.

RULES:
1. Maximize use of user ingredients.
2. Sort by match percentage.
3. Mix: 1 quick (<15m), 1 main, 1 snack.
4. Free: 5 recipes. Premium: 8 recipes.
5. Authentic Indian only.
6. Detailed steps for beginners.
7. Use Indian terms: "2 chamach", "tadka", "bhuno", etc.
8. Pro-tips for 2-3 steps.

NEVER: raw meat, alcohol, medical advice, non-food topics.`;

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
    return await callServerAI({
      prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
    });
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

In ingredients se ${params.isPremium ? 8 : 5} authentic Indian recipes suggest karo. (Premium users get more recipes, but we limit to 8 for stability).

Response MUST be in the exact JSON format as defined in your system instructions. No extra text outside JSON. Ensure the JSON is complete and not truncated.`;

  try {
    const data = await callServerAI({
      prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: recipeSchema,
    });

    if (!data || !data.recipes) {
      console.error("Invalid data structure from server:", data);
      throw new Error("AI Chef ne sahi format mein jawab nahi diya.");
    }

    const recipes = data.recipes.map((r: any) => ({
      ...r,
      image: `https://picsum.photos/seed/${r.name_english?.replace(/\s/g, '') || 'food'}/800/600`
    }));

    return {
      recipes,
      chefMessage: data.chef_message || "Arrey beta, dekho maine kya banaya!",
      dailyTip: data.daily_tip || "Khana hamesha pyaar se banao."
    };
  } catch (error: any) {
    console.error("Error generating recipes:", error);
    const errorMessage = error.message || "Maaf karna beta, kuch gadbad ho gayi.";
    return { 
      recipes: [], 
      chefMessage: errorMessage, 
      dailyTip: "Tip: Settings mein jaake API Key check karein." 
    };
  }
}
