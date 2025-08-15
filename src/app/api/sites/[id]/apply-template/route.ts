import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { updateAllNavigationContent, validateNavigationUpdates } from '@/utils/navigationUtils';
import { validateTemplate } from '@/utils/templateUtils';

// POST /api/sites/[id]/apply-template - Apply a template to a site (replace all pages)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let originalPages: any[] = [];
  let transaction: any = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the site to check ownership
    const site = await prisma.site.findUnique({ where: { id: params.id } });
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const requestBody = await req.json();
    const { templateId } = requestBody;
    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }
    
    console.log(`=== APPLY TEMPLATE API DEBUG ===`);
    console.log(`Request body:`, requestBody);
    console.log(`Template ID received:`, templateId);
    console.log(`Starting template application for site ${site.subdomain} with template ${templateId}`);
    const startTime = Date.now();
    
    // Get the full template data
    const template = await prisma.template.findUnique({ 
      where: { id: templateId }, 
      select: { 
        pages: true,
        name: true,
        category: true 
      } 
    });
    
    console.log('Template found:', template);
    console.log('Template pages:', template?.pages);
    console.log('Template pages type:', typeof template?.pages);
    console.log('Template pages keys:', template?.pages ? Object.keys(template.pages) : 'No pages');
    
    if (!template || !template.pages) {
      console.log('Template or pages not found, returning error');
      return NextResponse.json({ error: 'Template or template pages not found' }, { status: 404 });
    }
    
    // Ensure template.pages is properly structured
    if (typeof template.pages !== 'object' || template.pages === null) {
      console.log('Template pages is not an object:', template.pages);
      return NextResponse.json({ error: 'Template pages data is malformed' }, { status: 400 });
    }
    
    // Validate template structure early to fail fast
    const validation = validateTemplate(template as any);
    if (!validation.isValid) {
      console.log('Template validation failed:', validation.errors);
      return NextResponse.json({ 
        error: 'Template validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }
    
    if (validation.warnings.length > 0) {
      console.log('Template validation warnings:', validation.warnings);
    }
    
    console.log(`Applying template "${template.name}" to site ${site.subdomain}`);
    console.log(`Template has pages:`, Object.keys(template.pages));
    
    // Pre-process all template data to minimize transaction time
    const templatePages = template.pages as Record<string, { html: string; css: string; js: string }>;
    const availablePages = Object.keys(templatePages);
    
    if (availablePages.length === 0) {
      return NextResponse.json({ error: 'Template has no valid pages' }, { status: 400 });
    }
    
    console.log(`Pre-processing ${availablePages.length} template pages...`);
    
    // Create page mappings for navigation updates
    const pageMappings: Record<string, string> = {};
    availablePages.forEach(pageKey => {
      pageMappings[pageKey] = pageKey;
    });
    
    // Pre-process all page content and navigation updates
    const pagesToCreate: Array<{
      siteId: string;
      title: string;
      slug: string;
      content: {
        html: string;
        css: string;
        js: string;
      };
      htmlCode: string;
      cssCode: string;
      jsCode: string;
      isPublished: boolean;
      renderMode: string;
    }> = [];
    const pageTitles: Record<string, string> = { 
      home: 'Home', 
      about: 'About', 
      contact: 'Contact', 
      services: 'Services', 
      product: 'Product',
      portfolio: 'Portfolio',
      blog: 'Blog',
      pricing: 'Pricing'
    };
    
    for (const key of availablePages) {
      const pageData = templatePages[key];
      console.log(`Processing page ${key}:`, pageData);
      
      if (!pageData || typeof pageData !== 'object') {
        console.log(`Skipping page ${key} - invalid page data structure`);
        continue;
      }
      
      if (!pageData.html || typeof pageData.html !== 'string' || pageData.html.trim().length === 0) {
        console.log(`Skipping page ${key} - no HTML content`);
        continue;
      }
      
      console.log(`Processing page ${key} with HTML length: ${pageData.html.length}`);
      
      // Use the utility function to update navigation links
      const updatedContent = updateAllNavigationContent(
        {
          html: pageData.html,
          css: pageData.css || '',
          js: pageData.js || ''
        },
        {
          siteSubdomain: site.subdomain,
          pageMappings,
          preserveExternalLinks: true
        }
      );
      
      // Validate the navigation updates
      const validation = validateNavigationUpdates(
        pageData.html,
        updatedContent.html,
        availablePages
      );
      
      if (!validation.isValid) {
        console.warn(`Navigation validation issues for page ${key}:`, validation.issues);
      }
      
      // Prepare page data for batch creation
      pagesToCreate.push({
        siteId: site.id,
        title: pageTitles[key] || key.charAt(0).toUpperCase() + key.slice(1),
        slug: key,
        content: {
          html: updatedContent.html,
          css: updatedContent.css,
          js: updatedContent.js,
        },
        // Also populate the flat code fields so the editor/preview can render immediately
        htmlCode: updatedContent.html,
        cssCode: updatedContent.css,
        jsCode: updatedContent.js,
        isPublished: true,
        renderMode: 'html',
      });
      
      console.log(`Page ${key} prepared successfully`);
    }
    
    if (pagesToCreate.length === 0) {
      console.log('No valid pages were prepared for creation');
      return NextResponse.json({ error: 'No valid pages found in template' }, { status: 400 });
    }
    
    console.log(`Pre-processing completed in ${Date.now() - startTime}ms`);
    console.log(`Ready to create ${pagesToCreate.length} pages in transaction`);
    console.log('Pages to create:', pagesToCreate.map(p => ({ slug: p.slug, title: p.title, htmlLength: p.htmlCode.length })));
    
    // Start a transaction for atomicity with increased timeout
    transaction = await prisma.$transaction(async (tx: any) => {
      const txStartTime = Date.now();
      console.log('Transaction started, backing up existing pages...');
      
      // Backup existing pages before deletion
      originalPages = await tx.page.findMany({ 
        where: { siteId: site.id },
        select: { id: true, title: true, slug: true, content: true, htmlCode: true, cssCode: true, jsCode: true }
      });
      
      console.log(`Backed up ${originalPages.length} existing pages in ${Date.now() - txStartTime}ms`);
      
      // Delete all existing pages for the site
      const deleteStartTime = Date.now();
      const deletedPages = await tx.page.deleteMany({ where: { siteId: site.id } });
      console.log(`Deleted ${deletedPages.count} existing pages in ${Date.now() - deleteStartTime}ms`);
      
      // Batch create all pages at once to minimize transaction time
      if (pagesToCreate.length > 0) {
        const createStartTime = Date.now();
        const createdPageResults = await tx.page.createMany({
          data: pagesToCreate,
          skipDuplicates: false,
        });
        
        console.log(`Batch created ${createdPageResults.count} pages in ${Date.now() - createStartTime}ms`);
        
        // Fetch the created pages to get their IDs and details
        const fetchStartTime = Date.now();
        const createdPageDetails = await tx.page.findMany({
          where: { 
            siteId: site.id,
            slug: { in: availablePages }
          },
          select: { id: true, slug: true, title: true }
        });
        
        console.log(`Fetched page details in ${Date.now() - fetchStartTime}ms`);
        
        // Log each created page
        createdPageDetails.forEach((page: { id: string; slug: string; title: string }) => {
          console.log(`Created page: ${page.slug} with ID: ${page.id}`);
        });
        
        // Update site information to reflect the new template
        const updateStartTime = Date.now();
        await tx.site.update({
          where: { id: site.id },
          data: {
            updatedAt: new Date(),
            // You could add a templateId field to track which template is applied
          }
        });
        
        console.log(`Updated site in ${Date.now() - updateStartTime}ms`);
        
        console.log(`Transaction completed in ${Date.now() - txStartTime}ms`);
        return { createdPages: createdPageDetails, totalPages: createdPageDetails.length };
      }
      
      throw new Error('No pages were prepared for creation');
    }, {
      timeout: 30000 // Increase timeout to 30 seconds
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`Template "${template.name}" applied successfully in ${totalTime}ms. Created ${transaction.totalPages} pages:`, transaction.createdPages);
    
    // Return detailed information about the applied template
    return NextResponse.json({ 
      success: true, 
      message: `Template "${template.name}" applied successfully. Created ${transaction.totalPages} pages.`,
      pageSlugs: transaction.createdPages,
      totalPages: transaction.totalPages,
      processingTime: totalTime,
      templateName: template.name,
      templateCategory: template.category,
      appliedPages: transaction.createdPages.map((page: any) => ({
        id: page.id,
        slug: page.slug,
        title: page.title
      })),
      siteSubdomain: site.subdomain,
      siteId: site.id
    });
    
  } catch (error: any) {
    console.error('=== TEMPLATE APPLICATION ERROR ===');
    console.error('Error applying template:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // If we have a transaction and original pages, try to restore them
    if (transaction && originalPages.length > 0) {
      console.log('Attempting to restore original pages...');
      try {
        await prisma.page.createMany({
          data: originalPages.map(page => ({
            siteId: page.siteId,
            title: page.title,
            slug: page.slug,
            content: page.content,
            htmlCode: page.htmlCode,
            cssCode: page.cssCode,
            jsCode: page.jsCode,
            isPublished: true,
            renderMode: 'html',
          })),
          skipDuplicates: false,
        });
        console.log('Original pages restored successfully');
      } catch (restoreError) {
        console.error('Failed to restore original pages:', restoreError);
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to apply template',
      details: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 