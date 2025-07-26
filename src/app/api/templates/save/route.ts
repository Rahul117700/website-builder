import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, category, description, html, css, js, preview } = body;
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let template = null;
  let attempt = 0;
  while (attempt < 3) {
    try {
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
          preview,
          createdBy: session.user.id,
          approved: false,
        },
        select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true, updatedAt: true },
      });
      break;
    } catch (err: any) {
      if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
        // Slug already exists, add random suffix and retry
        slug = slug + '-' + Math.random().toString(36).slice(2, 6);
        attempt++;
      } else {
        return NextResponse.json({ error: err.message || 'Failed to save template' }, { status: 500 });
      }
    }
  }
  if (!template) {
    return NextResponse.json({ error: 'Could not create a unique slug for this template.' }, { status: 500 });
  }
  // Also create a MyTemplate record for the user
  await prisma.myTemplate.create({
    data: {
      userId: session.user.id,
      templateId: template.id,
      name: template.name,
      html: template.html,
      css: template.css,
      js: template.js,
      // reactCode is not handled here, but can be added if needed
    },
  });
  return NextResponse.json(template);
} 