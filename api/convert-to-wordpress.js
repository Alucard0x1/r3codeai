import { JSDOM } from 'jsdom';
import JSZip from 'jszip';

// WordPress Theme Generator
function generateWordPressTheme(html, analysis, themeOptions) {
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

${analysis.components.header ? analysis.components.header.outerHTML.replace(/static content/g, '<?php bloginfo("name"); ?>') : '<header><h1><?php bloginfo("name"); ?></h1></header>'}
${analysis.components.navigation ? analysis.components.navigation.outerHTML.replace(/<nav[^>]*>.*?<\/nav>/gs, '<?php wp_nav_menu(array("theme_location" => "primary")); ?>') : ''}`;

  // Generate footer.php
  const footerPhp = `
${analysis.components.footer ? analysis.components.footer.outerHTML : '<footer><p>&copy; <?php echo date("Y"); ?> <?php bloginfo("name"); ?></p></footer>'}

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
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { html, analysis, themeOptions } = req.body;
    
    if (!html || !analysis || !themeOptions) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
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
}
