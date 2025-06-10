import { JSDOM } from 'jsdom';

// HTML Analysis Engine
function analyzeHTMLStructure(html) {
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
      canConvert: score >= 50, // Lowered threshold for better conversion rate
      recommendations
    };
    
    return {
      structure,
      suitability,
      components
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
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
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
}
