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

    // Fetch user's channels
    const channels = await prisma.channel.findMany({
        where: { userId: session.user.id },
        select: { id: true },
        take: 2 // We just need to know if there's 0, 1, or more
    });

    if (channels.length === 1) {
        // If exactly one channel, go directly to customization
        redirect(`/auth/dashboard/channels/${channels[0].id}/customize`);
    } else if (channels.length > 1) {
        // If multiple, go to the list view to choose which one to edit
        redirect('/auth/dashboard/channels');
    } else {
        // FALLBACK: Auto-create a default channel for new users
        try {
            // 1. Get the first available template
            const template = await prisma.channelTemplate.findFirst();
            if (!template) {
                console.error('No channel templates found in database');
                redirect('/auth/dashboard/channels');
            }

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

            // 4. Create the channel record
            const newChannel = await prisma.channel.create({
                data: {
                    name: baseName,
                    slug,
                    userId: session.user.id,
                    templateId: template.id,
                    status: 'ACTIVE',
                    published: true,
                },
            });

            // 5. Redirect to the editor for the newly created channel
            redirect(`/auth/dashboard/channels/${newChannel.id}/customize`);

        } catch (error) {
            console.error('Failed to auto-create channel:', error);
            redirect('/auth/dashboard/channels');
        }
    }
}
