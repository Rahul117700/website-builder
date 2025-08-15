/**
 * Utility functions for template management and validation
 */

export interface TemplatePage {
  html: string;
  css: string;
  js: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  pages: Record<string, TemplatePage>;
  preview?: string;
  isPremium?: boolean;
  price?: number;
}

/**
 * Validates a template structure
 */
export function validateTemplate(template: Template): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.pages || Object.keys(template.pages).length === 0) {
    errors.push('Template must have at least one page');
  }

  // Validate each page
  Object.entries(template.pages).forEach(([pageKey, pageData]) => {
    if (!pageData.html || pageData.html.trim().length === 0) {
      errors.push(`Page "${pageKey}" must have HTML content`);
    }

    // Check for common issues
    if (pageData.html && pageData.html.includes('href="#')) {
      warnings.push(`Page "${pageKey}" contains hash links that may not work properly`);
    }

    if (pageData.html && pageData.html.includes('onclick=')) {
      warnings.push(`Page "${pageKey}" contains inline onclick handlers - consider using event listeners`);
    }

    // Check for external dependencies
    const externalDeps = extractExternalDependencies(pageData.html, pageData.css, pageData.js);
    if (externalDeps.length > 0) {
      warnings.push(`Page "${pageKey}" has external dependencies: ${externalDeps.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extracts external dependencies from template content
 */
export function extractExternalDependencies(
  html: string,
  css: string,
  js: string
): string[] {
  const dependencies: string[] = [];

  // Check for external CSS files
  const cssLinkRegex = /href=["']([^"']*\.css[^"']*)["']/gi;
  let match;
  while ((match = cssLinkRegex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith('data:')) {
      dependencies.push(match[1]);
    }
  }

  // Check for external JavaScript files
  const jsScriptRegex = /src=["']([^"']*\.js[^"']*)["']/gi;
  while ((match = jsScriptRegex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith('data:')) {
      dependencies.push(match[1]);
    }
  }

  // Check for external fonts
  const fontRegex = /@import\s+url\(["']([^"']*)["']\)/gi;
  while ((match = fontRegex.exec(css)) !== null) {
    if (match[1] && !match[1].startsWith('data:')) {
      dependencies.push(match[1]);
    }
  }

  // Check for external images
  const imgRegex = /src=["']([^"']*)["']/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith('data:') && !match[1].startsWith('#')) {
      dependencies.push(match[1]);
    }
  }

  return [...new Set(dependencies)];
}

/**
 * Generates a preview of a template page
 */
export function generateTemplatePreview(
  pageData: TemplatePage,
  pageKey: string,
  options: {
    width?: number;
    height?: number;
    includeStyles?: boolean;
  } = {}
): string {
  const { width = 375, height = 640, includeStyles = true } = options;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} - Preview</title>
        ${includeStyles ? `<style>${pageData.css || ''}</style>` : ''}
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: #fff; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .preview-container {
            width: ${width}px;
            height: ${height}px;
            overflow: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${pageData.html || ''}
        </div>
        ${pageData.js ? `<script>${pageData.js}</script>` : ''}
      </body>
    </html>
  `;

  return html;
}

/**
 * Estimates the complexity of a template
 */
export function estimateTemplateComplexity(template: Template): {
  score: number;
  level: 'Simple' | 'Medium' | 'Complex';
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  const totalPages = Object.keys(template.pages).length;
  score += totalPages * 10;
  factors.push(`${totalPages} pages`);

  // Analyze content complexity
  Object.entries(template.pages).forEach(([pageKey, pageData]) => {
    const htmlLength = pageData.html?.length || 0;
    const cssLength = pageData.css?.length || 0;
    const jsLength = pageData.js?.length || 0;

    if (htmlLength > 5000) {
      score += 20;
      factors.push(`Page "${pageKey}" has extensive HTML (${Math.round(htmlLength / 1000)}k chars)`);
    }

    if (cssLength > 3000) {
      score += 15;
      factors.push(`Page "${pageKey}" has extensive CSS (${Math.round(cssLength / 1000)}k chars)`);
    }

    if (jsLength > 2000) {
      score += 25;
      factors.push(`Page "${pageKey}" has extensive JavaScript (${Math.round(jsLength / 1000)}k chars)`);
    }

    // Check for interactive elements
    if (pageData.html?.includes('onclick=') || pageData.html?.includes('addEventListener')) {
      score += 15;
      factors.push(`Page "${pageKey}" has interactive elements`);
    }

    // Check for forms
    if (pageData.html?.includes('<form')) {
      score += 10;
      factors.push(`Page "${pageKey}" contains forms`);
    }

    // Check for external dependencies
    const deps = extractExternalDependencies(pageData.html, pageData.css, pageData.js);
    if (deps.length > 0) {
      score += deps.length * 5;
      factors.push(`Page "${pageKey}" has ${deps.length} external dependencies`);
    }
  });

  let level: 'Simple' | 'Medium' | 'Complex';
  if (score < 50) {
    level = 'Simple';
  } else if (score < 100) {
    level = 'Medium';
  } else {
    level = 'Complex';
  }

  return { score, level, factors };
}

/**
 * Generates a summary of template features
 */
export function generateTemplateSummary(template: Template): {
  features: string[];
  technologies: string[];
  responsive: boolean;
  interactive: boolean;
} {
  const features: string[] = [];
  const technologies: string[] = [];
  let responsive = false;
  let interactive = false;

  Object.values(template.pages).forEach(pageData => {
    const html = pageData.html || '';
    const css = pageData.css || '';
    const js = pageData.js || '';

    // Check for responsive design
    if (css.includes('@media') || css.includes('flexbox') || css.includes('grid')) {
      responsive = true;
      features.push('Responsive Design');
    }

    // Check for interactivity
    if (js.length > 0 || html.includes('onclick=') || html.includes('addEventListener')) {
      interactive = true;
      features.push('Interactive Elements');
    }

    // Check for forms
    if (html.includes('<form')) {
      features.push('Forms');
    }

    // Check for animations
    if (css.includes('animation') || css.includes('transition') || css.includes('@keyframes')) {
      features.push('Animations');
    }

    // Check for modern CSS features
    if (css.includes('flexbox') || css.includes('grid')) {
      features.push('Modern Layout');
    }

    // Check for JavaScript frameworks
    if (js.includes('React') || js.includes('Vue') || js.includes('Angular')) {
      technologies.push('JavaScript Framework');
    }

    if (js.includes('jQuery')) {
      technologies.push('jQuery');
    }
  });

  // Remove duplicates
  features.splice(0, features.length, ...Array.from(new Set(features)));
  technologies.splice(0, technologies.length, ...Array.from(new Set(technologies)));

  return { features, technologies, responsive, interactive };
} 