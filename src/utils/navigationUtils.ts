/**
 * Utility functions for handling navigation link updates when applying templates
 */

export interface NavigationUpdateOptions {
  siteSubdomain: string;
  pageMappings: Record<string, string>; // old slug -> new slug
  preserveExternalLinks?: boolean;
}

/**
 * Updates navigation links in HTML content to work with the new site structure
 */
export function updateNavigationLinks(
  html: string,
  options: NavigationUpdateOptions
): string {
  const { siteSubdomain, pageMappings, preserveExternalLinks = true } = options;
  
  let updatedHtml = html;
  
  // Update page-specific navigation links
  Object.entries(pageMappings).forEach(([oldSlug, newSlug]) => {
    const oldSlugPatterns = [
      oldSlug,
      oldSlug.replace(/-/g, ''),
      oldSlug.replace(/_/g, ''),
      oldSlug.charAt(0).toUpperCase() + oldSlug.slice(1),
      oldSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ];
    
    oldSlugPatterns.forEach(pattern => {
      // Update href attributes
      const hrefRegex = new RegExp(
        `href=["'](?:/|#)?${pattern}(?:["']|/["']|$)`,
        'gi'
      );
      updatedHtml = updatedHtml.replace(hrefRegex, (match) => {
        if (match.includes('/')) {
          return match.replace(
            new RegExp(`(?:/|#)?${pattern}(?:/)?`, 'i'),
            `/${newSlug}`
          );
        }
        return match.replace(new RegExp(`${pattern}`, 'i'), newSlug);
      });
      
      // Update onclick handlers
      const onclickRegex = new RegExp(
        `onclick=["'](?:window\\.)?location\\.href\\s*=\\s*["'](?:/|#)?${pattern}["']`,
        'gi'
      );
      updatedHtml = updatedHtml.replace(
        onclickRegex,
        `onclick="window.location.href='/s/${siteSubdomain}/${newSlug}'"`
      );
      
      // Update data attributes
      const dataAttrRegex = new RegExp(
        `data-page=["']${pattern}["']`,
        'gi'
      );
      updatedHtml = updatedHtml.replace(dataAttrRegex, `data-page="${newSlug}"`);
    });
  });
  
  // Update relative links to use absolute paths (but preserve external links)
  if (preserveExternalLinks) {
    updatedHtml = updatedHtml.replace(
      /href=["']\/(?!s\/|http|https|mailto|tel|#)/g,
      `href="/s/${siteSubdomain}/`
    );
  } else {
    updatedHtml = updatedHtml.replace(
      /href=["']\/(?!s\/)/g,
      `href="/s/${siteSubdomain}/`
    );
  }
  
  return updatedHtml;
}

/**
 * Updates navigation links in JavaScript code
 */
export function updateJavaScriptNavigation(
  jsCode: string,
  options: NavigationUpdateOptions
): string {
  const { siteSubdomain, pageMappings, preserveExternalLinks = true } = options;
  
  let updatedJs = jsCode;
  
  // Update page-specific navigation in JavaScript
  Object.entries(pageMappings).forEach(([oldSlug, newSlug]) => {
    const oldSlugPatterns = [
      oldSlug,
      oldSlug.replace(/-/g, ''),
      oldSlug.replace(/_/g, ''),
      oldSlug.charAt(0).toUpperCase() + oldSlug.slice(1)
    ];
    
    oldSlugPatterns.forEach(pattern => {
      // Update location.href assignments
      const jsNavRegex = new RegExp(
        `(?:window\\.)?location\\.href\\s*=\\s*["'](?:/|#)?${pattern}["']`,
        'gi'
      );
      updatedJs = updatedJs.replace(
        jsNavRegex,
        `window.location.href='/s/${siteSubdomain}/${newSlug}'`
      );
      
      // Update router.push calls (if using a router)
      const routerPushRegex = new RegExp(
        `router\\.push\\(["'](?:/|#)?${pattern}["']\\)`,
        'gi'
      );
      updatedJs = updatedJs.replace(
        routerPushRegex,
        `router.push('/s/${siteSubdomain}/${newSlug}')`
      );
    });
  });
  
  // Update relative navigation in JavaScript
  if (preserveExternalLinks) {
    updatedJs = updatedJs.replace(
      /location\.href\s*=\s*["']\/(?!s\/|http|https|mailto|tel|#)/g,
      `location.href='/s/${siteSubdomain}/`
    );
  } else {
    updatedJs = updatedJs.replace(
      /location\.href\s*=\s*["']\/(?!s\/)/g,
      `location.href='/s/${siteSubdomain}/`
    );
  }
  
  return updatedJs;
}

/**
 * Updates navigation links in CSS (for any CSS-based navigation)
 */
export function updateCSSNavigation(
  cssCode: string,
  options: NavigationUpdateOptions
): string {
  const { siteSubdomain, pageMappings } = options;
  
  let updatedCss = cssCode;
  
  // Update any CSS selectors that might reference page-specific classes
  Object.entries(pageMappings).forEach(([oldSlug, newSlug]) => {
    const oldSlugPatterns = [
      oldSlug,
      oldSlug.replace(/-/g, ''),
      oldSlug.replace(/_/g, '')
    ];
    
    oldSlugPatterns.forEach(pattern => {
      // Update CSS selectors that reference page slugs
      const cssSelectorRegex = new RegExp(
        `\\.${pattern}(?![a-zA-Z0-9_-])`,
        'gi'
      );
      updatedCss = updatedCss.replace(cssSelectorRegex, `.${newSlug}`);
    });
  });
  
  return updatedCss;
}

/**
 * Comprehensive function to update all navigation-related content
 */
export function updateAllNavigationContent(
  content: {
    html: string;
    css: string;
    js: string;
  },
  options: NavigationUpdateOptions
): {
  html: string;
  css: string;
  js: string;
} {
  return {
    html: updateNavigationLinks(content.html, options),
    css: updateCSSNavigation(content.css, options),
    js: updateJavaScriptNavigation(content.js, options)
  };
}

/**
 * Validates that navigation links are properly updated
 */
export function validateNavigationUpdates(
  originalContent: string,
  updatedContent: string,
  expectedPatterns: string[]
): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  expectedPatterns.forEach(pattern => {
    // Check if old patterns still exist
    const oldPatternRegex = new RegExp(`href=["'](?:/|#)?${pattern}["']`, 'gi');
    if (oldPatternRegex.test(updatedContent)) {
      issues.push(`Old navigation pattern "${pattern}" still exists in updated content`);
    }
    
    // Check if new patterns are properly formatted
    const newPatternRegex = new RegExp(`href=["']/s/[^/]+/${pattern}["']`, 'gi');
    if (!newPatternRegex.test(updatedContent)) {
      issues.push(`New navigation pattern for "${pattern}" not found or improperly formatted`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
} 