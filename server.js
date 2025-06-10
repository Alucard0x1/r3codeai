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

const PORT = process.env.APP_PORT || 3000;
const MAX_REQUESTS_PER_IP = 10;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Available models: gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro, gemini-1.5-flash-8b
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

// Fast API endpoint for prompt enhancement
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enhancementPrompt = `Enhance this prompt to be more detailed and specific for web development. Keep it concise but comprehensive. Only return the enhanced prompt, nothing else.

Original: "${prompt}"

Enhanced:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancementPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200, // Keep it short and fast
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the response
    const cleanedPrompt = enhancedText
      .replace(/^Enhanced:\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    res.json({ enhancedPrompt: cleanedPrompt });

  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
});

app.post("/api/ask-ai", async (req, res) => {
  console.log('Received request to /api/ask-ai');
  console.log('Request body:', req.body);

  const { prompt, html, previousPrompt } = req.body;
  if (!prompt) {
    console.log('No prompt provided');
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  console.log('Processing prompt:', prompt);

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    req.ip ||
    "0.0.0.0";

  // Basic rate limiting
  ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
  if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
    return res.status(429).send({
      ok: false,
      message: "Rate limit exceeded. Please wait before making another request.",
    });
  }

  // Set up response headers for streaming
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    // Build conversation history
    let conversationHistory = "";
    if (previousPrompt) {
      conversationHistory += `Previous request: ${previousPrompt}\n`;
    }
    if (html) {
      conversationHistory += `Current code: ${html}\n`;
    }

    const systemPrompt = `You are a world-class UI/UX web developer and interface designer with deep expertise in creating modern, responsive, accessible, and highly interactive user experiences using only HTML, CSS, and JavaScript.

You must create beautiful, seamless, and intuitive interfaces that reflect the latest web design trends (such as glassmorphism, neumorphism, dark mode, minimalism, and microinteractions). Focus on delivering smooth, app-like, frictionless experiences with fast loading and meaningful transitions. All interactive elements (buttons, links, inputs) must have distinct, visually clear states for hover, focus, and active, with smooth transitions to make the interface feel responsive. Your layouts must be space-efficient, using purposeful and consistent spacing to avoid wasted area and ensure a clean, organized presentation.

Use semantic HTML5 elements to enhance structure, accessibility, and SEO. Incorporate SEO best practices such as proper use of heading tags (h1–h6), alt attributes on images, and meta tags for title, description, and OpenGraph (e.g., og:title, og:description, og:image).

You MUST prioritize TailwindCSS for styling. If you need to go beyond what Tailwind can do, include minimal and clean custom CSS inside a <style> tag.

Define and consistently use a primary, secondary, and accent color palette, plus a typographic scale for headings and body text.
All text must use a System UI font stack (e.g., font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;).
All buttons must have a consistent border-radius of exactly 3px.
The spacing, gap, or margin between individual cards or grouped components must be exactly 20px.

Lighthouse Performance Optimization
All generated code must be highly optimized to achieve excellent scores on Google Lighthouse tests, focusing on these core principles:

Minimize Layout Shift (CLS): All images, iframes, and other media elements must have explicit width and height attributes to reserve space. Avoid inserting content above existing content dynamically.
Optimize Largest Contentful Paint (LCP): Ensure critical, above-the-fold content (especially text and images) loads immediately. Use efficient image sizes and prioritize their loading.
Reduce Main-Thread Blocking (TBT): Defer loading of non-critical scripts and CSS. Keep JavaScript execution during page load to an absolute minimum.

When including images, you must adhere to the following sources:

For general placeholder images: Use Unsplash (https://source.unsplash.com/random/WIDTHxHEIGHT).
For images of people: Use the Random User Generator API (https://randomuser.me/api/portraits/).
For company logos: Use the Clearbit Logo API (https://logo.clearbit.com/:domain.com). This is restricted only to FAANG companies (Meta, Amazon, Apple, Netflix, Google).

Use only client-side, vanilla JavaScript. Apply efficient DOM manipulation techniques—minimize reflows/repaints and avoid unnecessary event bindings. Write clean, modular, and performant scripts within <script> tags. Your application logic must be robust:

For any content loaded dynamically, a loading state (e.g., a skeleton screen or spinner) must be shown.
If dynamic content is empty, a clear 'empty state' message must be displayed.
If an API call or image load fails, the UI must handle it gracefully with a fallback or error indicator, never a broken element.

Include icons only if you import them explicitly via a CDN (e.g., Heroicons, Font Awesome). Your designs must be responsive, accessible (keyboard and screen reader friendly), and WCAG-compliant.

Design with purpose, emphasizing usability, readability, speed, and aesthetic appeal. Everything should work out-of-the-box as a single, static HTML file.

ALWAYS PROVIDE THE RESPONSE AS A SINGLE HTML FILE. Do not include any explanation, description, or suggestion—output only the code.

${conversationHistory}

User request: ${prompt}`;

    // Prepare the request body for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      ]
    };

    // Make the API call to Gemini (non-streaming first)
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    // Handle non-streaming response (like your Python script)
    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      console.log('Generated text length:', generatedText.length);
      console.log('Starting to stream response...');

      // Stream the response word by word for real-time typing effect
      const words = generatedText.split(' ');
      let currentIndex = 0;

      const sendNextChunk = () => {
        if (currentIndex >= words.length) {
          console.log('Finished streaming response');
          res.end();
          return;
        }

        // Send 1-2 words at a time for realistic typing
        const chunkSize = Math.floor(Math.random() * 2) + 1;
        const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ') + ' ';

        console.log(`Sending chunk ${currentIndex}: "${chunk.substring(0, 50)}..."`);

        // Ensure the chunk is sent immediately
        res.write(chunk);
        res.flush && res.flush(); // Force flush if available

        currentIndex += chunkSize;

        // Delay between 30-100ms for realistic typing speed
        const delay = Math.floor(Math.random() * 70) + 30;
        setTimeout(sendNextChunk, delay);
      };

      // Start streaming immediately
      sendNextChunk();

    } else {
      console.error('No text generated in response:', data);
      throw new Error('No text generated by Gemini API');
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (!res.headersSent) {
      res.status(500).send({
        ok: false,
        message: error.message || "An error occurred while processing your request.",
      });
    } else {
      // Otherwise end the stream
      res.end();
    }
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
  console.log(`Gemini API Key configured: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`Using Gemini Model: ${GEMINI_MODEL}`);
});
