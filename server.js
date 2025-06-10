import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fs from "fs";
import { JSDOM } from "jsdom";
import JSZip from "jszip";

// Load environment variables from .env file
dotenv.config();

const app = express();

const ipAddresses = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const MAX_REQUESTS_PER_IP = 10;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

// System prompt function
function getSystemPrompt() {
  return `You are an expert web developer and UI/UX designer specializing in creating exceptional single-file HTML websites. Your task is to generate complete, production-ready HTML files that include embedded CSS and JavaScript.

## CORE REQUIREMENTS:
- Generate ONLY complete HTML code (no markdown, no explanations)
- Include all CSS in <style> tags within <head>
- Include all JavaScript in <script> tags before closing </body>
- Use semantic HTML5 elements for accessibility
- Implement responsive design with mobile-first approach
- Optimize for performance and fast loading
- Target 95+ Lighthouse scores across all metrics

## DESIGN PRINCIPLES:
- Modern, clean, and professional aesthetics
- Consistent spacing using a systematic scale (8px, 16px, 24px, 32px, etc.)
- Proper typography hierarchy with readable font sizes
- Accessible color contrast ratios (WCAG AA compliant)
- Smooth animations and micro-interactions
- Professional color schemes and gradients

## TECHNICAL STANDARDS:
- Valid HTML5 markup
- Modern CSS with custom properties (CSS variables)
- Flexbox and CSS Grid for layouts
- Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly interactive elements (44px minimum)
- Optimized images with proper alt text
- Fast loading with minimal external dependencies

## OUTPUT FORMAT:
Return ONLY the complete HTML code without any markdown formatting, explanations, or additional text. The HTML should be ready to save as an .html file and open in a browser immediately.`;
}

// Enhanced AI Models Configuration with latest models and proper endpoints
const AI_MODELS_CONFIG = {
  // Google Gemini Models - Updated to latest 2025 versions
  'gemini-2.5-pro': {
    provider: 'google',
    model: 'gemini-2.5-pro-preview-06-05',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 1.25, // $1.25 per 1M tokens
    outputCost: 10.00, // $10.00 per 1M tokens
    contextLength: 1048576, // 1M tokens
    features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'large-context'],
    description: 'Google\'s most advanced reasoning model with Deep Think capabilities'
  },
  'gemini-2.5-flash': {
    provider: 'google',
    model: 'gemini-2.5-flash-preview-05-20',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.15, // $0.15 per 1M tokens
    outputCost: 0.60, // $0.60 per 1M tokens
    contextLength: 1048576, // 1M tokens
    features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'fast'],
    description: 'Google\'s first hybrid reasoning model with adjustable thinking budgets'
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
  'gemini-1.5-pro': {
    provider: 'google',
    model: 'gemini-1.5-pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 1.25,
    outputCost: 5.00,
    contextLength: 2000000, // 2M tokens
    features: ['text', 'multimodal', 'reasoning', 'large-context'],
    description: 'Google\'s most capable model with 2M context'
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
  'gemini-2.5-flash-native-audio': {
    provider: 'google',
    model: 'gemini-2.5-flash-preview-native-audio-dialog',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-native-audio-dialog:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.15,
    outputCost: 0.60,
    contextLength: 1048576,
    features: ['text', 'audio', 'video', 'native-audio-output'],
    description: 'High quality, natural conversational audio outputs'
  },
  'gemini-2.0-flash-image-gen': {
    provider: 'google',
    model: 'gemini-2.0-flash-preview-image-generation',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.075,
    outputCost: 0.30,
    contextLength: 1000000,
    features: ['text', 'multimodal', 'image-generation'],
    description: 'Conversational image generation and editing'
  },
  'imagen-3': {
    provider: 'google',
    model: 'imagen-3.0-generate-002',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.20,
    outputCost: 0.80,
    contextLength: 8000,
    features: ['text-to-image', 'image-generation'],
    description: 'Most advanced image generation model'
  },
  'veo-2': {
    provider: 'google',
    model: 'veo-2.0-generate-001',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    inputCost: 0.50,
    outputCost: 2.00,
    contextLength: 8000,
    features: ['text-to-video', 'video-generation'],
    description: 'High quality video generation'
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
async function callGoogleGemini(prompt, model) {
  const config = AI_MODELS_CONFIG[model];
  if (!config || !config.apiKey) {
    throw new Error(`Google API key not configured for model: ${model}`);
  }

  // Use the hardcoded enhanced system prompt
  // The enhanced prompt should be fetched from the /api/enhance-prompt endpoint by the client
    // For the purpose of this backend, we'll assume the client sends the full prompt (original or enhanced)
    const fullPrompt = prompt; // Placeholder, client should manage enhancement

    // Original line that used the local function:
    // const enhancedPrompt = buildEnhancedSystemPrompt() + '\n\n' + prompt;
  
  const requestData = {
    contents: [{
      parts: [{
        text: enhancedPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Google Gemini API Error:', errorData);
    throw new Error(`Google Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Google Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
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
        content: enhancedPrompt
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
        content: enhancedPrompt
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
        content: enhancedPrompt
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
          content: enhancedPrompt
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
        content: enhancedPrompt
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
    const { prompt, model = 'gemini-2.5-flash', html, previousPrompt } = req.body;

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
    const response = await callAIModel(fullPrompt, model);

    // For now, simulate streaming by sending the response in chunks
    const chunks = response.match(/.{1,100}/g) || [response];
    
    for (let i = 0; i < chunks.length; i++) {
      res.write(chunks[i]);
      // Small delay to simulate real streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.end();
  } catch (error) {
    console.error('Error in ask-ai:', error);
    res.status(500).json({
      error: error.message,
      suggestion: error.message.includes('Ollama') ?
        'Try using a cloud model like gemini-2.0-flash or claude-sonnet' :
        'Please check your API keys and try again'
    });
  }
});

// Update enhance-prompt endpoint
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.5-flash' } = req.body;

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

    const enhancementPrompt = `You are an expert prompt engineer specializing in web development and UI/UX design. Your task is to enhance user prompts to produce exceptional single-file HTML websites.

PROMPT ENHANCEMENT REQUEST:
Please enhance this web development prompt to be more specific, detailed, and likely to produce outstanding results:

Original prompt: "${prompt}"

Enhanced prompt should:
- Be more specific about design requirements and visual style
- Include modern UI/UX best practices and current design trends
- Specify technical requirements (responsive design, accessibility, performance optimization)
- Add creative elements that would make the result stand out and be memorable
- Include specific color schemes, typography choices, or interactive elements if appropriate
- Make it optimized for single HTML file generation with embedded CSS and JavaScript
- Suggest appropriate high-quality images and their placement
- Include specific layout patterns and component suggestions

Return only the enhanced prompt without any explanations or additional text.

Enhanced prompt:`;

    const response = await callAIModel(enhancementPrompt, model);

    res.json({
      enhancedPrompt: response.trim(),
      model: {
        name: model,
        provider: modelConfig.provider,
        description: modelConfig.description
      }
    });
  } catch (error) {
    console.error('Error in enhance-prompt:', error);
    res.status(500).json({
      error: error.message,
      suggestion: error.message.includes('Ollama') ?
        'Try using a cloud model for prompt enhancement' :
        'Please check your API keys and try again'
    });
  }
});



// WordPress HTML Analysis API
app.post("/api/analyze-html", async (req, res) => {
  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // HTML Analysis function
    const analyzeHTMLStructure = (html) => {
      try {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Check for semantic structure
        const structure = {
          hasHeader: !!document.querySelector('header, .header, #header'),
          hasNavigation: !!document.querySelector('nav, .nav, .navigation, #nav'),
          hasMainContent: !!document.querySelector('main, .main, #main, .content, #content'),
          hasSidebar: !!document.querySelector('aside, .sidebar, #sidebar'),
          hasFooter: !!document.querySelector('footer, .footer, #footer'),
          contentSections: []
        };
        
        // Detect content sections
        const sections = document.querySelectorAll('section, .section, article, .article');
        structure.contentSections = Array.from(sections).map(section => section.className || section.tagName);
        
        // Extract components
        const components = {
          header: document.querySelector('header, .header, #header'),
          navigation: document.querySelector('nav, .nav, .navigation, #nav'),
          main: document.querySelector('main, .main, #main, .content, #content'),
          sidebar: document.querySelector('aside, .sidebar, #sidebar'),
          footer: document.querySelector('footer, .footer, #footer')
        };

        // Convert DOM elements to strings safely
        const safeComponents = {};
        Object.keys(components).forEach(key => {
          if (components[key]) {
            safeComponents[key] = {
              outerHTML: components[key].outerHTML,
              className: components[key].className,
              tagName: components[key].tagName
            };
          } else {
            safeComponents[key] = null;
          }
        });
        
        // Calculate suitability score
        let score = 0;
        
        // Basic structure points
        if (structure.hasHeader) score += 20;
        if (structure.hasMainContent) score += 30;
        if (structure.hasFooter) score += 15;
        if (structure.hasNavigation) score += 15;
        
        // Content organization points
        if (structure.contentSections.length > 0) score += 10;
        if (structure.hasSidebar) score += 5;
        
        // Check for responsive design indicators
        const hasResponsiveCSS = html.includes('viewport') || 
                                html.includes('@media') || 
                                html.includes('flex') || 
                                html.includes('grid');
        if (hasResponsiveCSS) score += 5;
        
        // Generate recommendations
        const recommendations = [];
        if (!structure.hasHeader) recommendations.push("Add a header section for better theme structure");
        if (!structure.hasMainContent) recommendations.push("Add a main content area");
        if (!structure.hasFooter) recommendations.push("Add a footer section");
        if (!structure.hasNavigation) recommendations.push("Add navigation menu for WordPress integration");
        if (structure.contentSections.length === 0) recommendations.push("Add content sections for better organization");
        
        const suitability = {
          score,
          canConvert: score >= 50,
          recommendations
        };
        
        return {
          structure,
          suitability,
          components: safeComponents
        };
        
      } catch (error) {
        console.error('HTML Analysis Error:', error);
        return {
          structure: {
            hasHeader: false,
            hasNavigation: false,
            hasMainContent: false,
            hasSidebar: false,
            hasFooter: false,
            contentSections: []
          },
          suitability: {
            score: 0,
            canConvert: false,
            recommendations: ["HTML structure could not be analyzed"]
          },
          components: {}
        };
      }
    };

    const analysis = analyzeHTMLStructure(html);
    
    return res.status(200).json({
      analysis,
      canConvert: analysis.suitability.canConvert,
      recommendations: analysis.suitability.recommendations
    });
    
  } catch (error) {
    console.error('Analysis API Error:', error);
    return res.status(500).json({ error: 'Failed to analyze HTML' });
  }
});

// WordPress Theme Conversion API
app.post("/api/convert-to-wordpress", async (req, res) => {
  try {
    const { html, analysis, themeOptions } = req.body;
    
    if (!html || !analysis || !themeOptions) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // WordPress Theme Generator function
    const generateWordPressTheme = (html, analysis, themeOptions) => {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Extract CSS
      const styleElements = document.querySelectorAll('style');
      let extractedCSS = '';
      styleElements.forEach(style => {
        extractedCSS += style.textContent + '\n';
      });
      
      // Extract JavaScript
      const scriptElements = document.querySelectorAll('script');
      let extractedJS = '';
      scriptElements.forEach(script => {
        if (script.textContent && !script.src) {
          extractedJS += script.textContent + '\n';
        }
      });
      
      // Generate style.css with WordPress theme header
      const styleCss = `/*
Theme Name: ${themeOptions.name}
Description: ${themeOptions.description}
Version: ${themeOptions.version}
Author: R3Code AI
*/

${extractedCSS}`;

      // Generate header.php
      const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

${analysis.components && analysis.components.header && analysis.components.header.outerHTML ? analysis.components.header.outerHTML.replace(/static content/g, '<?php bloginfo("name"); ?>') : '<header><h1><?php bloginfo("name"); ?></h1></header>'}
${analysis.components && analysis.components.navigation && analysis.components.navigation.outerHTML ? analysis.components.navigation.outerHTML.replace(/<nav[^>]*>.*?<\/nav>/gs, '<?php wp_nav_menu(array("theme_location" => "primary")); ?>') : ''}`;

      // Generate footer.php
      const footerPhp = `
${analysis.components && analysis.components.footer && analysis.components.footer.outerHTML ? analysis.components.footer.outerHTML : '<footer><p>&copy; <?php echo date("Y"); ?> <?php bloginfo("name"); ?></p></footer>'}

<?php wp_footer(); ?>
</body>
</html>`;

      // Generate index.php
      const indexPhp = `<?php get_header(); ?>

<main class="main-content">
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                <div class="post-content">
                    <?php the_content(); ?>
                </div>
                <div class="post-meta">
                    <span>By <?php the_author(); ?></span>
                    <span>on <?php the_date(); ?></span>
                </div>
            </article>
        <?php endwhile; ?>
    <?php else : ?>
        <p>No posts found.</p>
    <?php endif; ?>
</main>

<?php get_footer(); ?>`;

      // Generate functions.php
      const functionsPhp = `<?php
// Theme setup
function ${themeOptions.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    
    // Register navigation menu
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'textdomain'),
    ));
}
add_action('after_setup_theme', '${themeOptions.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_setup');

// Enqueue styles and scripts
function ${themeOptions.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scripts() {
    wp_enqueue_style('theme-style', get_stylesheet_uri());
    ${extractedJS ? `wp_enqueue_script('theme-script', get_template_directory_uri() . '/assets/js/theme.js', array(), '1.0.0', true);` : ''}
}
add_action('wp_enqueue_scripts', '${themeOptions.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scripts');

// Add custom post types and fields as needed
?>`;

      // Generate single.php
      const singlePhp = `<?php get_header(); ?>

<main class="main-content">
    <?php while (have_posts()) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <h1><?php the_title(); ?></h1>
            <div class="post-meta">
                <span>By <?php the_author(); ?></span>
                <span>on <?php the_date(); ?></span>
            </div>
            <div class="post-content">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>`;

      // Generate page.php
      const pagePhp = `<?php get_header(); ?>

<main class="main-content">
    <?php while (have_posts()) : the_post(); ?>
        <article id="page-<?php the_ID(); ?>" <?php post_class(); ?>>
            <h1><?php the_title(); ?></h1>
            <div class="page-content">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>`;

      const themeFiles = {
        'style.css': styleCss,
        'index.php': indexPhp,
        'header.php': headerPhp,
        'footer.php': footerPhp,
        'functions.php': functionsPhp,
        'single.php': singlePhp,
        'page.php': pagePhp
      };

      // Add JavaScript file if exists
      if (extractedJS) {
        themeFiles['assets/js/theme.js'] = extractedJS;
      }

      return themeFiles;
    };
    
    // Generate WordPress theme files
    const themeFiles = generateWordPressTheme(html, analysis, themeOptions);
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Add all theme files to ZIP
    Object.entries(themeFiles).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${themeOptions.name.toLowerCase().replace(/\s+/g, '-')}-theme.zip"`);
    
    return res.send(zipBuffer);
    
  } catch (error) {
    console.error('WordPress Conversion Error:', error);
    return res.status(500).json({ error: 'Failed to generate WordPress theme' });
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
