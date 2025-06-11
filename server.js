import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fs from "fs";
import { JSDOM } from "jsdom";
import JSZip from "jszip";
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env file
dotenv.config();

const app = express();

const ipAddresses = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const MAX_REQUESTS_PER_IP = 10;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
// Available models: gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro, gemini-1.5-flash-8b
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = "KAy5cCiDshDY26vY7-JhoSC6X_YAkaWFD8LdzYF81wc";
const UNSPLASH_API_URL = "https://api.unsplash.com";

// Default HTML template
const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>R3Code AI - Create Best UI/UX in Single HTML File</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <style>
        :root {
            --bg-color: #0A0A0A;
            --border-color: rgba(255, 255, 255, 0.1);
            --card-color: #141414;
            --text-color: #EAEAEA;
            --subtle-text-color: #888888;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 4rem 2rem;
            max-width: 900px;
            margin: 0 auto;
        }
        .main-content {
            text-align: center;
            width: 100%;
            animation: fadeIn 1.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .title {
            font-size: 3rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 1.5rem;
            letter-spacing: -1.5px;
        }
        .description {
            font-size: 1.1rem;
            color: var(--subtle-text-color);
            margin-bottom: 4rem;
            font-weight: 400;
            line-height: 1.7;
            max-width: 650px;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-content">
            <h2 class="title">Create. Design. Deploy.</h2>
            <p class="description">
                Create the best possible UI/UX in a single HTML file. Generate clean, elegant websites with AI assistance.
                Complete HTML, CSS, and JavaScript in one file ready for instant deployment.
            </p>
        </div>
    </div>
</body>
</html>`;

// System prompt function - Enhanced for creative, stunning designs with Unsplash integration
function getSystemPrompt() {
  return `ONLY USE HTML, CSS AND JAVASCRIPT. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. MAKE IT RESPONSIVE USING TAILWINDCSS. Use as much as you can TailwindCSS for the CSS, if you can't do something with TailwindCSS, then use custom CSS (make sure to import <script src="https://cdn.tailwindcss.com"></script> in the head). Also, try to elaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE.

## CREATIVE VISION & DESIGN PHILOSOPHY:
- Think like a world-class creative agency designer - every pixel matters
- Create designs that are not just functional, but emotionally engaging and memorable
- Push creative boundaries while maintaining usability and accessibility
- Blend artistic vision with cutting-edge web technologies
- Design experiences that tell a story and evoke emotions
- Focus on creating "wow moments" that surprise and delight users

## VISUAL EXCELLENCE STANDARDS:
- Stunning visual hierarchy with bold, confident typography choices
- Sophisticated color palettes that create mood and atmosphere (use gradients, rich colors)
- Creative use of whitespace, asymmetry, and visual tension
- Innovative layouts that break conventional patterns while remaining intuitive
- Rich visual textures, gradients, and depth effects
- Micro-animations and subtle motion that brings the design to life
- Professional photography-style imagery and visual elements

## CREATIVE TECHNIQUES TO EMPLOY:
- Hero sections with cinematic impact and strong visual storytelling
- Creative navigation patterns (sticky headers, floating menus, animated transitions)
- Innovative card designs with hover effects and depth
- Dynamic backgrounds (gradients, patterns, subtle animations)
- Creative button designs with engaging hover states and animations
- Unique section layouts that flow naturally but surprise the user
- Creative use of icons, illustrations, and visual metaphors
- Sophisticated loading states and micro-interactions
- Modern glassmorphism, neumorphism, or other contemporary design trends

## TECHNICAL EXCELLENCE:
- Use TailwindCSS for rapid styling with custom CSS for unique creative effects
- Implement smooth animations and transitions (CSS transforms, keyframes)
- Ensure responsive design that looks stunning on all devices
- Create semantic, accessible HTML structure
- Add interactive elements with JavaScript (smooth scrolling, animations, etc.)
- Use modern CSS features (CSS Grid, Flexbox, custom properties)

## CREATIVE INSPIRATION SOURCES:
- Award-winning agency websites (Awwwards, CSS Design Awards style)
- Modern SaaS landing pages with premium aesthetics
- Creative portfolio sites with innovative interactions
- Luxury brand websites with sophisticated design language
- Contemporary art and design movements

## UNSPLASH IMAGE INTEGRATION:
**CRITICAL: For ALL images, use the Unsplash placeholder system instead of broken URLs:**

### Image Placeholder Format:
Use this exact format for all images: UNSPLASH_IMAGE_WIDTHxHEIGHT_QUERY

### Examples:
- Hero background: UNSPLASH_IMAGE_1920x1080_coffee-shop
- Product images: UNSPLASH_IMAGE_400x300_coffee-beans
- Team photos: UNSPLASH_IMAGE_300x300_professional-portrait
- Gallery images: UNSPLASH_IMAGE_600x400_cafe-interior
- Background images: UNSPLASH_IMAGE_1200x800_modern-architecture

### Usage in HTML:
<img src="UNSPLASH_IMAGE_800x600_coffee-cup" alt="Coffee cup" class="w-full h-64 object-cover">
<div style="background-image: url('UNSPLASH_IMAGE_1920x1080_cafe-atmosphere');" class="hero-section">

### Query Guidelines:
- Use descriptive, relevant keywords separated by hyphens
- Match the content context (coffee-shop, business, technology, nature, etc.)
- Be specific for better image matching
- Examples: coffee-beans, modern-office, team-meeting, food-photography, abstract-design

**NEVER use placeholder.com, picsum.photos, or any other image services. ALWAYS use the UNSPLASH_IMAGE format.**

## OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code as a single file
- No markdown formatting, explanations, or additional text
- Include all necessary imports (TailwindCSS, fonts, icons if needed)
- Use UNSPLASH_IMAGE placeholders for ALL images
- Ensure the design is fully functional and visually stunning
- Make it responsive and interactive

Remember: You're not just building a website - you're crafting a digital masterpiece that showcases creativity and innovation. Make it extraordinary and memorable!`;
}

// Enhanced AI Models Configuration with latest models and proper endpoints
const AI_MODELS_CONFIG = {
  // Google Gemini Models - Working models only
  'gemini-2.5-flash-preview': {
    provider: 'google',
    model: 'gemini-2.5-flash-preview-05-20',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.15, // $0.15 per 1M tokens
    outputCost: 0.60, // $0.60 per 1M tokens
    contextLength: 1048576, // 1M tokens
    features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'fast'],
    description: 'Google\'s hybrid reasoning model with adjustable thinking budgets'
  },
  'gemini-2.0-flash': {
    provider: 'google',
    model: 'gemini-2.0-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.075, // per 1M tokens
    outputCost: 0.30,
    contextLength: 1000000,
    features: ['text', 'multimodal', 'code', 'fast', 'tool-use'],
    description: 'Google\'s fast multimodal model with native tool use'
  },
  'gemini-2.0-flash-001': {
    provider: 'google',
    model: 'gemini-2.0-flash-001',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.075,
    outputCost: 0.30,
    contextLength: 1000000,
    features: ['text', 'multimodal', 'code', 'fast', 'tool-use'],
    description: 'Google\'s stable fast multimodal model with native tool use'
  },
  'gemini-1.5-flash': {
    provider: 'google',
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.075,
    outputCost: 0.30,
    contextLength: 1000000,
    features: ['text', 'multimodal', 'code', 'fast'],
    description: 'Fast and versatile performance across a diverse variety of tasks'
  },
  'gemini-1.5-flash-001': {
    provider: 'google',
    model: 'gemini-1.5-flash-001',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.075,
    outputCost: 0.30,
    contextLength: 1000000,
    features: ['text', 'multimodal', 'code', 'fast'],
    description: 'Stable version of Gemini 1.5 Flash'
  },


  // Anthropic Claude Models - Updated to latest 2025 versions
  'claude-4-opus': {
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 15.00, // $15 per 1M tokens
    outputCost: 75.00, // $75 per 1M tokens
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'advanced-reasoning'],
    description: 'Anthropic\'s most powerful and capable model with superior reasoning'
  },
  'claude-4-sonnet': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 3.00, // $3 per 1M tokens
    outputCost: 15.00, // $15 per 1M tokens
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'high-performance'],
    description: 'Anthropic\'s high-performance model with exceptional reasoning'
  },
  'claude-3.7-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-7-sonnet-20250219',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 3.00,
    outputCost: 15.00,
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'extended-thinking'],
    description: 'Anthropic\'s high-performance model with early extended thinking'
  },
  'claude-3.5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 3.00,
    outputCost: 15.00,
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision'],
    description: 'Anthropic\'s balanced model for complex reasoning (legacy)'
  },
  'claude-3.5-haiku': {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 0.25,
    outputCost: 1.25,
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'fast'],
    description: 'Fastest model, intelligence at blazing speeds'
  },
  'claude-3-opus': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    inputCost: 15.00,
    outputCost: 75.00,
    contextLength: 200000,
    features: ['text', 'reasoning', 'code', 'analysis', 'vision'],
    description: 'Powerful model for complex tasks'
  },

  // DeepSeek Models - Updated to latest 2025 versions
  'deepseek-r1': {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    endpoint: 'https://api.deepseek.com/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY,
    inputCost: 0.55, // $0.55 per 1M tokens
    outputCost: 2.19, // $2.19 per 1M tokens
    contextLength: 128000,
    features: ['text', 'reasoning', 'code', 'thinking', 'step-by-step'],
    description: 'DeepSeek\'s latest reasoning model with enhanced capabilities'
  },
  'deepseek-v3': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    endpoint: 'https://api.deepseek.com/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY,
    inputCost: 0.27, // per 1M tokens
    outputCost: 1.10,
    contextLength: 128000,
    features: ['text', 'reasoning', 'code', 'efficient', 'open-source'],
    description: 'DeepSeek\'s general-purpose model with excellent performance'
  },

  // Mistral AI Models - Updated to latest 2025 versions (from documentation)
  'magistral-medium': {
    provider: 'mistral',
    model: 'magistral-medium-2506',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 2.50, // Estimated based on tier
    outputCost: 7.50,
    contextLength: 40000,
    features: ['text', 'reasoning', 'frontier-class'],
    description: 'Frontier-class reasoning model'
  },
  'mistral-medium': {
    provider: 'mistral',
    model: 'mistral-medium-2505',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 2.00,
    outputCost: 6.00,
    contextLength: 128000,
    features: ['text', 'multimodal', 'frontier-class'],
    description: 'Frontier-class multimodal model'
  },
  'mistral-large': {
    provider: 'mistral',
    model: 'mistral-large-2411',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 2.00,
    outputCost: 6.00,
    contextLength: 128000,
    features: ['text', 'multilingual', 'reasoning', 'code'],
    description: 'Top-tier reasoning model for high-complexity tasks'
  },
  'pixtral-large': {
    provider: 'mistral',
    model: 'pixtral-large-2411',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 2.00,
    outputCost: 6.00,
    contextLength: 128000,
    features: ['text', 'multimodal', 'frontier-class'],
    description: 'Frontier-class multimodal model'
  },
  'codestral': {
    provider: 'mistral',
    model: 'codestral-2501',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 1.00,
    outputCost: 3.00,
    contextLength: 256000,
    features: ['text', 'code', 'programming'],
    description: 'Cutting-edge language model for coding'
  },
  'mistral-ocr': {
    provider: 'mistral',
    model: 'mistral-ocr-2505',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    inputCost: 1.50,
    outputCost: 4.50,
    contextLength: 128000,
    features: ['text', 'ocr', 'document-understanding'],
    description: 'OCR service for extracting interleaved text and images'
  },

  // Meta Llama Models - Updated to latest 2025 versions
  'llama-3.3': {
    provider: 'meta',
    model: 'llama-3.3-70b-instruct',
    endpoint: 'https://api.deepinfra.com/v1/openai/chat/completions',
    apiKey: process.env.DEEPINFRA_API_KEY,
    inputCost: 0.59,
    outputCost: 0.79,
    contextLength: 128000,
    features: ['text', 'open-source', 'reasoning', 'efficient'],
    description: 'Meta\'s latest open-source model with high performance'
  },

  // Local Ollama (unchanged as it's local)
  'ollama': {
    provider: 'ollama',
    model: 'llama3.2',
    endpoint: 'http://localhost:11434/api/chat',
    apiKey: null,
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    features: ['text', 'local', 'private', 'free'],
    description: 'Local AI model running on your machine'
  }
};

// Reset rate limits every hour
setInterval(() => {
  ipAddresses.clear();
}, 60 * 60 * 1000);

app.use(cookieParser());
app.use(bodyParser.json());

// Add CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.static(path.join(__dirname, "dist")));

// Helper function to get Unsplash image URL
async function getUnsplashImageUrl(width = 800, height = 600, query = "", featured = false) {
  try {
    let endpoint = `${UNSPLASH_API_URL}/photos/random?w=${width}&h=${height}&fit=crop&crop=entropy`;
    
    if (query) {
      endpoint += `&query=${encodeURIComponent(query)}`;
    }
    
    if (featured) {
      endpoint += '&featured=true';
    }
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.urls.regular || data.urls.small;
    }
    
    // Fallback to placeholder if API fails
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=Image`;
  } catch (error) {
    console.log('Unsplash API error:', error.message);
    // Fallback to placeholder
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=Image`;
  }
}

// Function to replace Unsplash placeholders with actual URLs
async function replaceUnsplashPlaceholders(html) {
  // Find all UNSPLASH_IMAGE placeholders
  const placeholderRegex = /UNSPLASH_IMAGE_(\d+)x(\d+)(?:_([^"\s)]+))?/g;
  const matches = [...html.matchAll(placeholderRegex)];
  
  // Create a map to cache similar requests
  const imageCache = new Map();
  
  for (const match of matches) {
    const [fullMatch, width, height, query] = match;
    const cacheKey = `${width}x${height}_${query || 'general'}`;
    
    if (!imageCache.has(cacheKey)) {
      const imageUrl = await getUnsplashImageUrl(
        parseInt(width), 
        parseInt(height), 
        query || "", 
        false
      );
      imageCache.set(cacheKey, imageUrl);
      console.log(`Generated image URL for ${fullMatch}: ${imageUrl}`);
    }
    
    html = html.replace(fullMatch, imageCache.get(cacheKey));
  }
  
  return html;
}

// API endpoint to get Unsplash images
app.post('/api/unsplash-image', async (req, res) => {
  try {
    const { width = 800, height = 600, query = "", featured = false } = req.body;
    
    const imageUrl = await getUnsplashImageUrl(width, height, query, featured);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Unsplash image error:', error);
    res.status(500).json({ 
      error: 'Failed to get image',
      imageUrl: `https://via.placeholder.com/${width || 800}x${height || 600}/e5e7eb/6b7280?text=Image`
    });
  }
});

app.post("/api/deploy", async (req, res) => {
  const { html, title } = req.body;
  if (!html || !title) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  try {
    // Create a simple file-based deployment
    const timestamp = Date.now();
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .split("-")
      .filter(Boolean)
      .join("-")
      .slice(0, 50);

    const fileName = `${sanitizedTitle}-${timestamp}.html`;
    const deployPath = path.join(__dirname, "deployments");

    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(deployPath)) {
      fs.mkdirSync(deployPath, { recursive: true });
    }

    const filePath = path.join(deployPath, fileName);

    // Add a simple footer to the HTML
    const deployedHtml = html.replace(
      /<\/body>/,
      `<div style="position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
        Generated with DeepSite AI
      </div></body>`
    );

    fs.writeFileSync(filePath, deployedHtml);

    return res.status(200).send({
      ok: true,
      path: fileName,
      url: `/deployments/${fileName}`
    });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message,
    });
  }
});

// Enhanced API call functions for each provider
// Non-streaming version for enhance-prompt
async function callGoogleGemini(prompt, model) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(`Google API key not configured`);
  }

  try {
    // Get the model configuration
    const modelConfig = AI_MODELS_CONFIG[model];
    if (!modelConfig) {
      throw new Error(`Model configuration not found: ${model}`);
    }

    // Initialize the Google Gen AI client
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Configuration for the model
    const config = {
      responseMimeType: 'text/plain',
    };

    // Use the hardcoded enhanced system prompt
    // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Create the contents array as shown in sample_api_call.txt
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ];

    console.log(`Calling Google Gemini model: ${modelConfig.model}`);
    
    // Generate content using the new SDK with the actual model name
    const response = await ai.models.generateContent({
      model: modelConfig.model,
      config: config,
      contents: contents,
    });

    // Extract the text from the response
    if (response && response.text) {
      return response.text;
    } else {
      throw new Error('Invalid response structure from Google Gemini API');
    }

  } catch (error) {
    console.error('Google Gemini API Error:', error);
    throw new Error(`Google Gemini API Error: ${error.message}`);
  }
}

// Streaming version with Unsplash integration for ask-ai
async function callGoogleGeminiStreamWithUnsplash(prompt, model, res) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(`Google API key not configured`);
  }

  try {
    // Get the model configuration
    const modelConfig = AI_MODELS_CONFIG[model];
    if (!modelConfig) {
      throw new Error(`Model configuration not found: ${model}`);
    }

    // Initialize the Google Gen AI client
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Configuration for the model
    const config = {
      responseMimeType: 'text/plain',
    };

    // Create the contents array as shown in sample_api_call.txt
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    console.log(`Calling Google Gemini model (streaming): ${modelConfig.model}`);
    
    // Generate content stream using the new SDK with the actual model name
    const response = await ai.models.generateContentStream({
      model: modelConfig.model,
      config: config,
      contents: contents,
    });

    // Collect all chunks first to process Unsplash placeholders
    let fullResponse = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text;
      }
    }

    // Replace Unsplash placeholders with actual URLs
    const processedResponse = await replaceUnsplashPlaceholders(fullResponse);

    // Now stream the processed response
    const chunks = processedResponse.match(/.{1,100}/g) || [processedResponse];
    
    for (let i = 0; i < chunks.length; i++) {
      res.write(chunks[i]);
      // Small delay to simulate real streaming
      await new Promise(resolve => setTimeout(resolve, 30));
    }

  } catch (error) {
    console.error('Google Gemini Streaming API Error:', error);
    throw new Error(`Google Gemini Streaming API Error: ${error.message}`);
  }
}

async function callAnthropicClaude(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  if (!config || !config.apiKey) {
    throw new Error(`Anthropic API key not configured for model: ${model}`);
  }

  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;

  const requestData = {
    model: config.model,
    max_tokens: 8192,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: fullPrompt
      }
    ]
  };

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Anthropic Claude API Error:', errorData);
    throw new Error(`Anthropic Claude API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid response from Anthropic Claude API');
  }

  return data.content[0].text;
}

async function callMistralAI(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  if (!config || !config.apiKey) {
    throw new Error(`Mistral API key not configured for model: ${model}`);
  }

  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;

  const requestData = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: fullPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 8192,
    top_p: 0.95
  };

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Mistral AI API Error:', errorData);
    throw new Error(`Mistral AI API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from Mistral AI API');
  }

  return data.choices[0].message.content;
}

async function callMetaLlama(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  if (!config || !config.apiKey) {
    throw new Error(`DeepInfra API key not configured for model: ${model}`);
  }

  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;

  const requestData = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: fullPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 8192,
    top_p: 0.95
  };

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Meta Llama API Error:', errorData);
    throw new Error(`Meta Llama API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from Meta Llama API');
  }

  return data.choices[0].message.content;
}

async function callOllama(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;

  try {
    const requestData = {
      model: config.model,
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.95,
        num_predict: 8192
      }
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      timeout: 60000 // 60 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ollama API Error:', errorData);
      throw new Error(`Ollama not available. Please ensure Ollama is running locally with the model '${config.model}' installed.`);
    }

    const data = await response.json();
    
    if (!data.message || !data.message.content) {
      throw new Error('Invalid response from Ollama API');
    }

    return data.message.content;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.name === 'FetchError') {
      throw new Error(`Ollama not available. Please start Ollama and run: ollama pull ${config.model}`);
    }
    throw error;
  }
}

async function callDeepSeekAPI(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  if (!config || !config.apiKey) {
    throw new Error(`DeepSeek API key not configured for model: ${model}`);
  }

  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;

  const requestData = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: fullPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 8192,
    top_p: 0.95,
    stream: false
  };

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('DeepSeek API Error:', errorData);
    throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from DeepSeek API');
  }

  return data.choices[0].message.content;
}

// Enhanced model selection function
async function callAIModel(prompt, model) {
  const config = AI_MODELS_CONFIG[model];

  if (!config) {
    throw new Error(`Unsupported model: ${model}. Available models: ${Object.keys(AI_MODELS_CONFIG).join(', ')}`);
  }

  console.log(`🤖 Using ${config.provider} model: ${config.model}`);
  console.log(`💰 Estimated cost: $${config.inputCost}/1M input, $${config.outputCost}/1M output tokens`);
  console.log(`📝 Context length: ${config.contextLength.toLocaleString()} tokens`);
  console.log(`🎯 Features: ${config.features.join(', ')}`);

  try {
    switch (config.provider) {
      case 'google':
        return await callGoogleGemini(prompt, model);
      case 'anthropic':
        return await callAnthropicClaude(prompt, model);
      case 'mistral':
        return await callMistralAI(prompt, model);
      case 'meta':
        return await callMetaLlama(prompt, model);
      case 'deepseek':
        return await callDeepSeekAPI(prompt, model);
      case 'ollama':
        return await callOllama(prompt, model);
      default:
        throw new Error(`Provider ${config.provider} not implemented`);
    }
  } catch (error) {
    console.error(`Error calling ${config.provider} ${model}:`, error.message);
    
    // If Ollama fails, suggest fallback
    if (config.provider === 'ollama') {
      throw new Error(`Local Ollama model failed: ${error.message}\n\nTo use Ollama:\n1. Install: curl -fsSL https://ollama.ai/install.sh | sh\n2. Start: ollama serve\n3. Pull model: ollama pull ${config.model}`);
    }
    
    throw error;
  }
}

// System prompt generation is now handled by /api/enhance-prompt
/*
function buildEnhancedSystemPrompt() {
  return `You are an expert web developer and UI/UX designer specializing in creating exceptional single-file HTML websites. Create a complete, modern, and responsive HTML page that follows the latest web standards and best practices.

## CORE REQUIREMENTS:
- Generate a complete HTML document with embedded CSS and JavaScript
- Use modern web technologies (HTML5, CSS3, ES6+)
- Implement responsive design that works perfectly on all devices
- Follow semantic HTML structure for accessibility and SEO
- Ensure WCAG 2.1 AA accessibility standards compliance
- Optimize for performance (target 95+ Lighthouse score)
- Use modern CSS features (Grid, Flexbox, Custom Properties, Container Queries)
- Include proper meta tags, viewport settings, and SEO optimization
- Use high-quality images from Unsplash with proper alt text

## DESIGN SYSTEM - MODERN MINIMAL:
- Clean lines with abundant whitespace for breathing room
- Subtle shadows and depth for visual hierarchy
- Minimal but purposeful color palette
- Typography-focused design with excellent readability
- Consistent spacing using a modular scale (8px, 16px, 24px, 32px, 48px, 64px)
- Border radius of 8px-12px for modern feel
- Smooth transitions and micro-interactions

## COLOR STRATEGY:
- Use a sophisticated, AI-selected color palette based on content psychology
- Primary color for CTAs and important elements
- Secondary color for accents and highlights
- Neutral grays for text and backgrounds
- Ensure sufficient contrast ratios (4.5:1 minimum for text)
- Consider dark mode compatibility

## INTERACTION LEVEL - ADVANCED:
- Complex CSS keyframe animations for engaging experiences
- Micro-interactions on hover, focus, and click states
- Gesture support for mobile devices
- Loading states with skeleton screens or progress indicators
- Success animations with checkmarks or positive feedback
- Form validation with real-time feedback
- Smooth scroll behavior and parallax effects where appropriate

## DESIGN PHILOSOPHY - USER-FIRST:
- Prioritize user needs and clear user journeys
- Prominent, action-oriented CTAs with clear hierarchy
- Intuitive navigation that's immediately understandable
- Fast loading times and smooth performance
- Mobile-first approach scaling up to desktop
- Accessibility as a core feature, not an afterthought

## VISUAL HIERARCHY:
- Strong typographic hierarchy using size, weight, and spacing
- Use size, color, and positioning to guide user attention
- Implement clear information architecture
- Create scannable layouts with proper content grouping
- Strategic use of whitespace to separate content sections

## MICRO-INTERACTIONS:
- Button press feedback with subtle scale/shadow changes (transform: scale(0.98))
- Hover effects that provide immediate visual feedback
- Loading states for any dynamic content
- Form validation with inline error messages
- Smooth transitions between states (0.2s-0.3s duration)
- Progressive disclosure for complex interfaces

## PERFORMANCE TARGETS:
- Lighthouse Score: 95+ across all metrics
- Accessibility Level: WCAG AA minimum
- Optimize images with proper formats and lazy loading
- Minimize CSS/JS with efficient selectors and modern techniques
- Use system fonts or fast-loading web fonts
- Implement proper caching strategies

## TECHNICAL SPECIFICATIONS:
- Use CSS Grid for main layout structure
- Flexbox for component-level layouts
- CSS Custom Properties for theming and consistency
- Intersection Observer for scroll-based animations
- Modern JavaScript (ES6+) with proper error handling
- Progressive enhancement principles
- Semantic HTML5 elements (header, nav, main, section, article, aside, footer)

## IMAGE INTEGRATION:
- Use UNSPLASH_IMAGE_WIDTHxHEIGHT_QUERY format for automatic high-quality images
- Example: UNSPLASH_IMAGE_800x600_nature for nature images
- Always include descriptive alt text for accessibility
- Use appropriate image sizes for different screen densities

## OUTPUT FORMAT:
Return ONLY the complete HTML code without any markdown formatting, explanations, or additional text. The HTML should be ready to save as an .html file and open in a browser immediately. Ensure the code is clean, well-commented, and production-ready.`;
}
*/



// API endpoint for fetching models with connection status
app.get('/api/models', async (req, res) => {
  try {
    // Check API key availability for each provider
    const apiKeyStatus = {
      google: !!process.env.GOOGLE_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      mistral: !!process.env.MISTRAL_API_KEY,
      meta: !!process.env.DEEPINFRA_API_KEY,
      ollama: true // Always available locally
    };

    const modelsInfo = Object.entries(AI_MODELS_CONFIG).map(([key, config]) => {
      const isConnected = apiKeyStatus[config.provider] || false;
      
      return {
        id: key,
        name: key,
        provider: config.provider,
        description: config.description,
        features: config.features,
        contextLength: config.contextLength,
        cost: {
          input: config.inputCost,
          output: config.outputCost,
          free: config.inputCost === 0
        },
        available: key === 'ollama' ? 'Local installation required' : 'API key required',
        connected: isConnected
      };
    });

    res.json({
      models: modelsInfo,
      totalModels: modelsInfo.length,
      providers: [...new Set(modelsInfo.map(m => m.provider))],
      apiKeyStatus
    });
  } catch (error) {
    console.error('Error in /api/models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the ask-ai endpoint with streaming support
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt, model = 'gemini-1.5-flash', html, previousPrompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get model info for response
    const modelConfig = AI_MODELS_CONFIG[model];
    if (!modelConfig) {
      return res.status(400).json({
        error: `Unsupported model: ${model}`,
        availableModels: Object.keys(AI_MODELS_CONFIG)
      });
    }

    console.log(`🚀 Processing request with ${modelConfig.provider} ${model}`);
    console.log(`📝 User prompt: ${prompt.substring(0, 100)}...`);

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build the full prompt with system prompt
    let fullPrompt = prompt;
    if (html && html.trim() && html !== defaultHTML) {
      fullPrompt = `Based on this existing HTML code, please modify it according to the user's request:

EXISTING HTML:
${html}

USER REQUEST:
${prompt}

Please provide the complete modified HTML code.`;
    } else {
      fullPrompt = `${getSystemPrompt()}

USER REQUEST:
${prompt}`;
    }

    // Call the selected model with streaming
    if (modelConfig.provider === 'google') {
      // Use real streaming for Google models with Unsplash integration
      await callGoogleGeminiStreamWithUnsplash(fullPrompt, model, res);
      res.end();
    } else {
      // For other models, use the regular call and simulate streaming
      const response = await callAIModel(fullPrompt, model);
      
      // Replace Unsplash placeholders with actual URLs
      const processedResponse = await replaceUnsplashPlaceholders(response);
      
      // Simulate streaming by sending the response in chunks
      const chunks = processedResponse.match(/.{1,100}/g) || [processedResponse];
      
      for (let i = 0; i < chunks.length; i++) {
        res.write(chunks[i]);
        // Small delay to simulate real streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      res.end();
    }
  } catch (error) {
    console.error('Error in ask-ai:', error);
    res.status(500).json({
      error: error.message,
      suggestion: error.message.includes('Ollama') ?
        'Try using a cloud model like gemini-1.5-flash or claude-sonnet' :
        'Please check your API keys and try again'
    });
  }
});

// Update enhance-prompt endpoint
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.5-flash-preview-05-20' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const modelConfig = AI_MODELS_CONFIG[model];
    if (!modelConfig) {
      return res.status(400).json({
        error: `Unsupported model: ${model}`,
        availableModels: Object.keys(AI_MODELS_CONFIG)
      });
    }

    console.log(`🔧 Enhancing prompt with ${modelConfig.provider} ${model}`);

    const enhancementPrompt = `You are an expert web developer and UI/UX designer specializing in creating outstanding single-file HTML websites. You excel at modern design principles, performance optimization, and user experience.

Your task is to enhance prompts to create better, more detailed specifications for generating exceptional single HTML file websites.

Key enhancement areas:
- Modern UI/UX design patterns and best practices
- Responsive design with mobile-first approach
- Accessibility (WCAG 2.1 AA compliance)
- Performance optimization (Lighthouse 95+ scores)
- Semantic HTML5 structure
- CSS Grid/Flexbox layouts
- Smooth animations and micro-interactions
- Color psychology and typography hierarchy
- Component-based thinking (hero, navigation, cards, forms, etc.)
- Cross-browser compatibility
- SEO optimization
- High-quality imagery using Unsplash integration

Always specify:
1. Exact color palettes with hex codes
2. Typography choices (system fonts preferred)
3. Layout structure and components
4. Interactive elements and hover states
5. Responsive breakpoints
6. Loading states and error handling
7. Accessibility features (ARIA labels, focus management)
8. Performance requirements (image optimization, CSS/JS inline)
9. Specific image requirements with descriptive keywords for Unsplash

For images, always specify:
- Image dimensions and aspect ratios
- Descriptive keywords for image content (e.g., "coffee-shop", "modern-office", "team-meeting")
- Image placement and styling requirements
- Alt text requirements for accessibility

Original prompt to enhance: "${prompt}"

Return only the enhanced prompt with specific, actionable requirements including detailed image specifications:`;

    const response = await callAIModel(enhancementPrompt, model);

    res.json({
      enhancedPrompt: response.trim()
    });
  } catch (error) {
    console.error('Error in enhance-prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to enhance prompt'
    });
  }
});





// Serve deployed files
app.use("/deployments", express.static(path.join(__dirname, "deployments")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`✅ Google API Key configured: ${process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔥 DeepSeek API Key configured: ${process.env.DEEPSEEK_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🤖 Anthropic API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌟 Mistral API Key configured: ${process.env.MISTRAL_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🦙 DeepInfra API Key configured: ${process.env.DEEPINFRA_API_KEY ? 'Yes' : 'No'}`);
  console.log(`💻 Ollama Base URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log(`🚀 All 2025 AI models are ready to use!`);
});
