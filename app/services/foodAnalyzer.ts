// app/services/foodAnalyzer.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FoodResult } from "../types/food";
import { extractJSONFromText } from "../utils/foodParser";

const FOOD_ANALYSIS_PROMPT = `Analyze this food image and return result in per 100 gram and return ONLY a JSON object:
{
  "name": "Dish Name",
  "cuisine": "Cuisine",
  "ingredients": "List of main items",
  "nutritionalInfo": { "calories": "...", "protein": "...", "carbs": "...", "fat": "..." },
  "details": { "prepTime": "...", "servingSize": "...", "difficulty": "...", "taste": "..." }
}`;

export async function analyzeFoodImage({ apiKey, imageBase64 }: { apiKey: string, imageBase64: string }): Promise<FoodResult> {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use stable multimodal model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
        FOOD_ANALYSIS_PROMPT,
        {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg",
            },
        },
    ]);

    const text = result.response.text();
    return extractJSONFromText(text);
}