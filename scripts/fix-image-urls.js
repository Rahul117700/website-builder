/**
 * Fix Image URLs Script
 * 
 * This script fixes common image URL issues:
 * 1. Removes /public/ prefix from URLs
 * 2. Ensures URLs start with /
 * 3. Updates database with corrected URLs
 * 
 * Run with: node scripts/fix-image-urls.js
 * 
 * Add --dry-run flag to preview changes without applying them:
 * node scripts/fix-image-urls.js --dry-run
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

function fixImageUrl(url) {
    if (!url) return null;

    // If it's an external URL (S3, etc.), leave it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    let fixed = url;

    // Remove /public/ prefix if present
    if (fixed.startsWith('/public/')) {
        fixed = fixed.replace('/public/', '/');
    } else if (fixed.startsWith('public/')) {
        fixed = fixed.replace('public/', '/');
    }

    // Ensure it starts with /
    if (!fixed.startsWith('/')) {
        fixed = '/' + fixed;
    }

    return fixed;
}

async function fixImageUrls() {
    try {
        console.log(isDryRun ? '🔍 DRY RUN MODE - No changes will be made\n' : '🔧 Fixing image URLs...\n');

        const channels = await prisma.channel.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                coverImage: true,
            },
        });

        console.log(`Found ${channels.length} channels\n`);

        let fixedCount = 0;

        for (const channel of channels) {
            const updates = {};
            let needsUpdate = false;

            // Check profile image
            if (channel.profileImage) {
                const fixed = fixImageUrl(channel.profileImage);
                if (fixed !== channel.profileImage) {
                    updates.profileImage = fixed;
                    needsUpdate = true;
                    console.log(`📺 ${channel.name} (@${channel.slug})`);
                    console.log(`   Profile Image:`);
                    console.log(`   ❌ Old: ${channel.profileImage}`);
                    console.log(`   ✅ New: ${fixed}`);
                }
            }

            // Check cover image
            if (channel.coverImage) {
                const fixed = fixImageUrl(channel.coverImage);
                if (fixed !== channel.coverImage) {
                    updates.coverImage = fixed;
                    needsUpdate = true;
                    if (!updates.profileImage) {
                        console.log(`📺 ${channel.name} (@${channel.slug})`);
                    }
                    console.log(`   Cover Image:`);
                    console.log(`   ❌ Old: ${channel.coverImage}`);
                    console.log(`   ✅ New: ${fixed}`);
                }
            }

            // Apply updates
            if (needsUpdate) {
                if (!isDryRun) {
                    await prisma.channel.update({
                        where: { id: channel.id },
                        data: updates,
                    });
                    console.log(`   ✅ Updated\n`);
                } else {
                    console.log(`   ℹ️  Would update (dry run)\n`);
                }
                fixedCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Channels needing fixes: ${fixedCount}/${channels.length}`);

        if (isDryRun && fixedCount > 0) {
            console.log(`\n💡 Run without --dry-run to apply these changes`);
        } else if (fixedCount > 0) {
            console.log(`\n✅ All image URLs have been fixed!`);
        } else {
            console.log(`\n✅ No issues found - all URLs are correct!`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixImageUrls();
