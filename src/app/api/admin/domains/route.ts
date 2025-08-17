import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

function stripProtocol(value: string): string {
	return value.replace(/^https?:\/\//i, '');
}

function normalizeHost(raw: string): string {
	const host = stripProtocol(raw).toLowerCase().trim();
	const withoutPath = host.split('/')[0] || host;
	const withoutPort = withoutPath.replace(/:\d+$/, '');
	return withoutPort.replace(/\/$/, '');
}

// GET /api/admin/domains - list all domain mappings
export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const rows = await prisma.domain.findMany({
		include: {
			site: { select: { id: true, name: true, subdomain: true, userId: true } },
		},
		orderBy: { createdAt: 'desc' },
	});

	// hydrate owner email for convenience
	const userIds = Array.from(new Set(rows.map((r) => r.site.userId)));
	const users = await prisma.user.findMany({
		where: { id: { in: userIds } },
		select: { id: true, email: true },
	});
	const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

	return NextResponse.json(
		rows.map((r) => ({
			id: r.id,
			host: r.host,
			siteId: r.siteId,
			site: { id: r.site.id, name: r.site.name, subdomain: r.site.subdomain },
			ownerEmail: userMap[r.site.userId] || '',
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}))
	);
}

// POST /api/admin/domains - create a domain mapping
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const siteId: string | undefined = body.siteId;
		const hostRaw: string | undefined = body.host;
		if (!siteId || !hostRaw) {
			return NextResponse.json({ error: 'siteId and host are required' }, { status: 400 });
		}
		const host = normalizeHost(hostRaw);

		const created = await prisma.$transaction(async (tx: any) => {
			const row = await tx.domain.create({ data: { siteId, host } });
			// keep Site.customDomain in sync (set to last written domain)
			await tx.site.update({ where: { id: siteId }, data: { customDomain: host } });
			return row;
		});

		return NextResponse.json(created, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to create mapping' }, { status: 500 });
	}
}


