import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Sustainability Coach Endpoint
  app.post("/api/ai-coach", async (req, res) => {
    try {
      const { activities, recentFootprints, chatHistory, customPrompt } = req.body;

      let prompt = `You are an elite, encouraging AI Sustainability Coach on the "Carbon Footprint Awareness Platform". 
Your role is to analyze the user's activity log and footprint, highlight their major emission sources, propose realistic and prioritized behavioral improvements (actionable tips), explain their ecological impact in simple, engaging terms, and keep them highly motivated.

Below is the user's recent footprint/activity context:
- Activities data: ${JSON.stringify(activities || {})}
- Recent calculated footprints: ${JSON.stringify(recentFootprints || [])}

`;

      if (chatHistory && chatHistory.length > 0) {
        prompt += `Here is the conversation history:
${chatHistory.map((item: any) => `${item.role === 'user' ? 'User' : 'Coach'}: ${item.content}`).join('\n')}
`;
      }

      if (customPrompt) {
        prompt += `User's message: "${customPrompt}"\n`;
      } else {
        prompt += `Please provide a general assessment, a list of 3-4 highly actionable tips based on their highest emission source, and an encouraging sign-off.\n`;
      }

      prompt += `
Please write your response in beautiful, neat Markdown format. Maintain a warm, wise, upbeat, and practical coaching tone. Avoid overly scientific jargon, and focus on human scale shifts (like switching to LED, batching laundry, trying meatless meals, public transport, etc.).`;

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [prompt],
      });

      res.json({ response: response.text || "I was unable to analyze your data at this time. Let's keep trying to reduce our footprint together!" });
    } catch (error: any) {
      console.error("Gemini Coach Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI Coach" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
