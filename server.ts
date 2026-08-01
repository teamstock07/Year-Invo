import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI Insights Endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in Secrets.",
      });
    }

    const { businessData, queryType, language } = req.body;
    const isBengali = language === "bn";

    let prompt = "";
    if (queryType === "sales_prediction") {
      prompt = `Act as an expert AI Business Intelligence Analyst for a SaaS POS & Inventory system. 
Analyze the provided sales & inventory data:
${JSON.stringify(businessData, null, 2)}

Provide a concise, highly actionable sales prediction, demand forecast, and stock reorder recommendations for the next 30 days.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points and bold highlights. Keep it practical for a small to medium business owner.`;
    } else if (queryType === "expense_analysis") {
      prompt = `Act as an expert AI Financial Advisor for a retail business.
Analyze the expense and sales figures:
${JSON.stringify(businessData, null, 2)}

Identify cost-saving opportunities, unusual expense patterns, and profit optimization suggestions.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points.`;
    } else {
      prompt = `Act as an expert AI Business Strategy Advisor.
Analyze this overall business summary:
${JSON.stringify(businessData, null, 2)}

Provide 3 key business growth insights, 2 risk warnings (e.g. low stock or high due amounts), and 3 profit improvement ideas.
Language: ${isBengali ? "Bengali (বাংলা)" : "English"}.
Format as clean Markdown with bullet points.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI business insights.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
