import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/bookings - Get all bookings for a site
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId');

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if the user owns the site
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bookings for the site
    const bookings = await prisma.booking.findMany({
      where: {
        siteId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      bookingDate,
      time,
      numberOfPeople,
      message,
      siteId,
    } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !bookingDate || !time || !numberOfPeople || !siteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the site exists
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone,
        date: new Date(bookingDate),
        time,
        guests: numberOfPeople,
        message,
        status: 'pending',
        site: {
          connect: {
            id: siteId,
          },
        },
      },
    });

    // TODO: Send email notification to site owner

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
