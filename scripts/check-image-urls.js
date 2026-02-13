/**
 * Database Image URL Checker
 * 
 * This script helps diagnose profile image issues by:
 * 1. Checking what's stored in the database
 * 2. Verifying if the image files exist
 * 3. Suggesting fixes for common issues
 * 
 * Run this in production to diagnose the issue:
 * node scripts/check-image-urls.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkImageUrls() {
    try {
        console.log('🔍 Checking channel image URLs...\n');

        // Get all channels with images
        const channels = await prisma.channel.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                coverImage: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        console.log(`Found ${channels.length} channels\n`);

        for (const channel of channels) {
            console.log(`\n📺 Channel: ${channel.name} (@${channel.slug})`);
            console.log(`   ID: ${channel.id}`);
            console.log(`   Owner: ${channel.user.name}`);

            // Check profile image
            if (channel.profileImage) {
                console.log(`   ✅ Profile Image: ${channel.profileImage}`);

                // Check if it's a local file
                if (!channel.profileImage.startsWith('http')) {
                    const filePath = path.join(process.cwd(), 'public', channel.profileImage.replace(/^\//, ''));
                    const exists = fs.existsSync(filePath);
                    console.log(`      File exists: ${exists ? '✅ YES' : '❌ NO'}`);
                    if (!exists) {
                        console.log(`      Expected path: ${filePath}`);
                    }
                } else {
                    console.log(`      Type: External URL (S3/CDN)`);
                }
            } else {
                console.log(`   ❌ Profile Image: Not set`);
                if (channel.user.image) {
                    console.log(`      Fallback: User image available (${channel.user.image})`);
                } else {
                    console.log(`      Fallback: None available`);
                }
            }

            // Check cover image
            if (channel.coverImage) {
                console.log(`   ✅ Cover Image: ${channel.coverImage}`);

                // Check if it's a local file
                if (!channel.coverImage.startsWith('http')) {
                    const filePath = path.join(process.cwd(), 'public', channel.coverImage.replace(/^\//, ''));
                    const exists = fs.existsSync(filePath);
                    console.log(`      File exists: ${exists ? '✅ YES' : '❌ NO'}`);
                    if (!exists) {
                        console.log(`      Expected path: ${filePath}`);
                    }
                } else {
                    console.log(`      Type: External URL (S3/CDN)`);
                }
            } else {
                console.log(`   ❌ Cover Image: Not set`);
            }
        }

        console.log('\n\n📊 Summary:');
        const withProfileImage = channels.filter(c => c.profileImage).length;
        const withCoverImage = channels.filter(c => c.coverImage).length;
        console.log(`   Channels with profile image: ${withProfileImage}/${channels.length}`);
        console.log(`   Channels with cover image: ${withCoverImage}/${channels.length}`);

        console.log('\n💡 Common Issues:');
        console.log('   1. Image path starts with /public/ - Should start with / or /uploads/');
        console.log('   2. Image file doesn\'t exist - File may have been deleted or not uploaded');
        console.log('   3. S3 URL not accessible - Check S3 permissions or bucket configuration');
        console.log('   4. Production file system is ephemeral - Use S3 or persistent storage');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkImageUrls();
