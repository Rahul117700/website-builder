import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { TemplateType } from '@/types';

// GET /api/sites - Get all sites for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sites = await prisma.site.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/sites - Create a new site
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, subdomain, template } = await req.json();

    // Validate required fields
    if (!name || !subdomain || !template) {
      return NextResponse.json(
        { error: 'Name, subdomain, and template are required' },
        { status: 400 }
      );
    }

    // Validate template
    if (!['general', 'restaurant', 'pharma'].includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template type. Must be one of: general, restaurant, pharma' },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken
    const existingSite = await prisma.site.findUnique({
      where: {
        subdomain,
      },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 400 }
      );
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        name,
        description,
        subdomain,
        template,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    // Create default pages based on template
    let defaultPages = getDefaultPages(template, site.id);
    // Remove isHomePage property from each page object before createMany
    await prisma.page.createMany({
      data: defaultPages.map(({ isHomePage, ...rest }) => rest),
    });

    // Create notification for website creation
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'site',
          message: `Your website "${name}" has been created successfully! You can now start building your pages.`,
        },
      });
    } catch (error) {
      console.error('Error creating website creation notification:', error);
    }

    // Return the site with a user-accessible URL
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const siteUrl = `${BASE_URL}/s/${site.subdomain}`;
    return NextResponse.json({ ...site, url: siteUrl }, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get default pages based on template
function getDefaultPages(template: TemplateType, siteId: string) {
  const commonPages = [
    {
      title: 'Home',
      slug: 'home',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to our website' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is the homepage of your new website. You can edit this content in the dashboard.',
              },
            ],
          },
        ],
      }),
      isHomePage: true,
      siteId,
    },
    {
      title: 'About',
      slug: 'about',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'About Us' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is the about page of your new website. You can edit this content in the dashboard.',
              },
            ],
          },
        ],
      }),
      isHomePage: false,
      siteId,
    },
    {
      title: 'Contact',
      slug: 'contact',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Contact Us' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is the contact page of your new website. You can edit this content in the dashboard.',
              },
            ],
          },
        ],
      }),
      isHomePage: false,
      siteId,
    },
  ];

  // Add template-specific pages
  switch (template) {
    case 'pharma':
      return [
        ...commonPages,
        {
          title: 'Products',
          slug: 'products',
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Our Products' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Browse our range of pharmaceutical products.',
                  },
                ],
              },
            ],
          }),
          isHomePage: false,
          siteId,
        },
        {
          title: 'Health Tips',
          slug: 'health-tips',
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Health Tips' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Read our latest health tips and advice.',
                  },
                ],
              },
            ],
          }),
          isHomePage: false,
          siteId,
        },
      ];
    case 'restaurant':
      return [
        ...commonPages,
        {
          title: 'Menu',
          slug: 'menu',
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Our Menu' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Explore our delicious menu options.',
                  },
                ],
              },
            ],
          }),
          isHomePage: false,
          siteId,
        },
        {
          title: 'Reservations',
          slug: 'reservations',
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Make a Reservation' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Book a table at our restaurant.',
                  },
                ],
              },
            ],
          }),
          isHomePage: false,
          siteId,
        },
      ];
    default:
      return [
        ...commonPages,
        {
          title: 'Services',
          slug: 'services',
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Our Services' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Learn about the services we offer.',
                  },
                ],
              },
            ],
          }),
          isHomePage: false,
          siteId,
        },
      ];
  }
}
