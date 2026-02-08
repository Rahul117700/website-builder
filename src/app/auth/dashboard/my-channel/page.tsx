import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to generate unique slug
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default async function MyChannelRedirect() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Verify user exists and get correct ID (handle stale sessions)
    let userId = session.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
    });

    if (!user) {
        console.warn(`[MyChannel] User ID ${userId} from session not found in DB. Searching by email...`);
        const userByEmail = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            select: { id: true }
        });

        if (userByEmail) {
            userId = userByEmail.id;
            console.log(`[MyChannel] Found real user ID ${userId} for email ${session.user.email}`);
        } else {
            console.error(`[MyChannel] User ${session.user.email} not found in database. Redirecting to login.`);
            redirect('/login');
        }
    }

    // Fetch user's channels
    const channels = await prisma.channel.findMany({
        where: { userId },
        select: { id: true },
        take: 2 // We just need to know if there's 0, 1, or more
    });

    let newChannelId = null;

    if (channels.length === 1) {
        // If exactly one channel, go directly to customization
        redirect(`/auth/dashboard/channels/${channels[0].id}/customize`);
    } else if (channels.length > 1) {
        // If multiple, go to the list view to choose which one to edit
        redirect('/auth/dashboard/channels');
    } else {
        // FALLBACK: Auto-create a default channel for new users
        console.log(`[MyChannel] No channels found for user ${userId}. Attempting auto-creation...`);
        try {
            // 1. Get the first available template
            const template = await prisma.channelTemplate.findFirst({
                where: { isActive: true }
            });

            if (!template) {
                console.error('[MyChannel] CRITICAL: No active channel templates found in database');
                redirect('/auth/dashboard/channels');
            }

            console.log(`[MyChannel] Using template: ${template.name} (${template.id})`);

            // 2. Generate a default professional name
            const adjectives = ['Creative', 'Awesome', 'Modern', 'Elite', 'Global', 'Digital', 'Smart', 'Ultimate', 'Prime'];
            const nouns = ['Studio', 'Hub', 'Channel', 'Space', 'Arena', 'Center', 'Academy', 'World', 'Port'];
            const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            const baseName = `${randomAdj} ${randomNoun} ${Math.floor(Math.random() * 900) + 100}`;

            // 3. Generate a unique slug
            let slug = generateSlug(baseName);
            let slugExists = await prisma.channel.findUnique({
                where: { slug },
            });

            let counter = 1;
            while (slugExists) {
                slug = `${generateSlug(baseName)}-${counter}`;
                slugExists = await prisma.channel.findUnique({
                    where: { slug },
                });
                counter++;
            }

            console.log(`[MyChannel] Creating channel with name "${baseName}" and slug "${slug}"`);

            // 4. Create the channel record
            const newChannel = await prisma.channel.create({
                data: {
                    name: baseName,
                    slug,
                    userId: userId,
                    templateId: template.id,
                    status: 'ACTIVE',
                    published: true,
                },
            });

            console.log(`[MyChannel] Successfully created channel ${newChannel.id}`);
            newChannelId = newChannel.id;

        } catch (error) {
            // Check if it's a redirect error (which we should NOT catch or should re-throw)
            if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                throw error;
            }
            console.error('[MyChannel] Failed to auto-create channel:', error);
            redirect('/auth/dashboard/channels');
        }

        if (newChannelId) {
            redirect(`/auth/dashboard/channels/${newChannelId}/customize`);
        }
    }
}
