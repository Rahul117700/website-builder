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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await req.json();
		const host = body.host ? normalizeHost(body.host) : undefined;
		const siteId = body.siteId as string | undefined;

		const updated = await prisma.$transaction(async (tx: any) => {
			const row = await tx.domain.update({
				where: { id: params.id },
				data: { ...(host ? { host } : {}), ...(siteId ? { siteId } : {}) },
			});
			// If host provided, sync to site.customDomain for convenience
			if (host) {
				await tx.site.update({ where: { id: row.siteId }, data: { customDomain: host } });
			}
			return row;
		});

		return NextResponse.json(updated);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to update mapping' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);
	if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const deleted = await prisma.domain.delete({ where: { id: params.id } });
		return NextResponse.json(deleted);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to delete mapping' }, { status: 500 });
	}
}


