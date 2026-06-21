import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as xlsx from "xlsx";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.warn("Could not initialize Gemini API", error);
}

// Generate Image Route
app.post("/api/generate-image", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API not configured" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateImages({
        model: 'gemini-3-pro-image-preview',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
    });
      
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64Image = response.generatedImages[0].image.imageBytes;
        // Return as data URL
        res.json({ imageUrl: `data:image/jpeg;base64,${base64Image}` });
    } else {
        res.status(500).json({ error: "No image generated" });
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// Generate Excel Catalog Route
app.post("/api/generate-catalog", async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: "Invalid products data" });
    }

    // Format data for Excel
    const data = products.map((p: any) => ({
      'ID товара': p.id,
      'Название (RU)': p.name,
      'Название (KZ)': p.name_kz || '',
      'Категория': p.category_id,
      'Единица': p.unit,
      'Цена': p.base_price,
      'Наличие': p.stock_status,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Прайс-лист KökDüken");

    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="KokDuken_PriceList.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error("Error generating catalog excel:", error);
    res.status(500).json({ error: "Failed to generate catalog" });
  }
});

// Initialize server
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
