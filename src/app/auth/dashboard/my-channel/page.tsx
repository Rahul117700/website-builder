import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function MyChannelRedirect() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/dashboard/channels');
    }

    // Fetch user's channels (just need ID and count)
    const channels = await prisma.channel.findMany({
        where: { userId: session.user.id },
        select: { id: true },
        take: 2 // We just need to know if there's 0, 1, or more
    });

    if (channels.length === 1) {
        // If exactly one channel, go directly to customization
        redirect(`/auth/dashboard/channels/${channels[0].id}/customize`);
    } else {
        // If 0 or multiple, go to the list view
        redirect('/auth/dashboard/channels');
    }
}
