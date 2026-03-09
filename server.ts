import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", apiKeyPresent: !!process.env.GEMINI_API_KEY });
  });

  // API Routes
  app.post("/api/recipes", async (req, res) => {
    console.log("Received recipe request from client");
    try {
      const { prompt, systemInstruction, responseSchema } = req.body;
      
      let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
      
      // Masking for safety
      const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "None";
      const keyLength = apiKey.length;

      // Check for common placeholder values or empty strings
      if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey === "") {
        console.error("Valid GEMINI_API_KEY is missing in process.env");
        return res.status(500).json({ 
          error: "Arrey beta, API Key missing hai! Settings (⚙️) mein jaake 'GEMINI_API_KEY' set karo.",
          details: `Current Key: ${maskedKey} (Length: ${keyLength})`
        });
      }

      console.log(`Using API Key: ${maskedKey} (Length: ${keyLength})`);

      const ai = new GoogleGenAI({ apiKey });
      console.log("Calling Gemini API with model: gemini-3-flash-preview");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        console.error("Gemini returned empty response");
        throw new Error("AI Chef ne kuch nahi bola. Phir se try karo!");
      }

      console.log("Gemini response received successfully");
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Server API Error details:", error);
      
      // Handle specific Google API errors
      if (error.message?.includes("API key not valid")) {
        return res.status(400).json({ 
          error: "Aapki API Key valid nahi hai beta. Phir se check karo!",
          details: error.message
        });
      }
      
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
