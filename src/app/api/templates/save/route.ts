import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('=== /api/templates/save POST called ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    console.log('Session user ID:', session?.user?.id);
    console.log('Session user ID type:', typeof session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { name, category, description, html, css, js, preview, pages } = body;
    
    if (!name) {
      console.log('Name is required but not provided');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate a unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    console.log('Initial slug generated:', slug);
    
    let template = null;
                let attempt = 0;
            const maxAttempts = 20;

    while (attempt < maxAttempts) {
      try {
        console.log(`Attempt ${attempt + 1}: Checking slug "${slug}"`);
        
        // Check if slug already exists
        const existingTemplate = await prisma.template.findUnique({
          where: { slug }
        });

        if (!existingTemplate) {
          console.log(`Slug "${slug}" is available, creating template...`);
          
          // Create template with unique slug
          template = await prisma.template.create({
            data: {
              name,
              slug,
              price: 0,
              category,
              description,
              html,
              css,
              js,
              pages,
              preview,
              createdBy: session.user.id,
              approved: false,
            },
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              price: true, 
              html: true, 
              css: true, 
              js: true, 
              pages: true,
              category: true, 
              description: true, 
              preview: true, 
              createdBy: true, 
              approved: true, 
              createdAt: true, 
              updatedAt: true 
            },
          });
          console.log('Template created successfully:', template);
          break;
        } else {
          console.log(`Slug "${slug}" already exists, generating new one...`);
          // Generate a new slug with better uniqueness
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          slug = `${slug}-${timestamp}-${randomSuffix}`;
          console.log(`New slug generated: "${slug}"`);
          attempt++;
        }
      } catch (err: any) {
        console.error(`Error on attempt ${attempt + 1}:`, err);
        if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
          console.log('Slug uniqueness constraint violated, generating new slug...');
          // Slug already exists, generate new one with even more uniqueness
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 10);
          const nanoTime = process.hrtime.bigint().toString(36);
          slug = `${slug}-${timestamp}-${randomSuffix}-${nanoTime}`;
          console.log(`New slug after constraint violation: "${slug}"`);
          attempt++;
        } else {
          console.error('Non-slug related error:', err);
          return NextResponse.json({ 
            error: err.message || 'Failed to save template',
            details: err.code 
          }, { status: 500 });
        }
      }
    }

    if (!template) {
      console.log('Failed to create template after maximum attempts');
      return NextResponse.json({ 
        error: 'Could not create a unique slug for this template after multiple attempts.' 
      }, { status: 500 });
    }

    // Verify user exists before creating MyTemplate
    console.log('Verifying user exists before creating MyTemplate...');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log('User not found in database with ID:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('User verified:', { id: user.id, email: user.email, name: user.name });

    // Create MyTemplate record for the user
    try {
      console.log('Creating MyTemplate record...');
      const myTemplateData = {
        userId: session.user.id,
        templateId: template.id,
        name: template.name,
        html: template.html,
        css: template.css,
        js: template.js,
        pages: template.pages, // Include pages field
      };
      console.log('MyTemplate data:', myTemplateData);
      
      await prisma.myTemplate.create({
        data: myTemplateData,
      });
      console.log('MyTemplate created successfully');
    } catch (myTemplateError: any) {
      console.error('Error creating MyTemplate:', myTemplateError);
      console.error('MyTemplate error code:', myTemplateError.code);
      console.error('MyTemplate error meta:', myTemplateError.meta);
      // If MyTemplate creation fails, we should still return the template
      // but log the error for debugging
      console.warn('Template created but MyTemplate creation failed:', myTemplateError.message);
    }

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('=== Unexpected error in template save ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 