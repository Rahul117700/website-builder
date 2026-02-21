import { PrismaClient } from '@prisma/client';
import inquirer from 'inquirer';

const prisma = new PrismaClient();

async function main() {
    console.log('\n======================================');
    console.log('💎 FAKE METRICS GENERATOR TOOL');
    console.log('======================================\n');

    try {
        // Step 1: Find Channel
        const channelAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'channelName',
                message: 'Enter the exact Channel Name (or a part of it) to search:',
                validate: input => input ? true : 'Channel name is required',
            }
        ]);
        const channelName = channelAnswer.channelName;

        const channels = await prisma.channel.findMany({
            where: {
                name: { contains: channelName, mode: 'insensitive' }
            },
            select: { id: true, name: true, userId: true }
        });

        if (channels.length === 0) {
            console.log('❌ Error: No channel found matching that name.');
            process.exit(1);
        }

        let selectedChannel = channels[0];

        if (channels.length > 1) {
            console.log(`\nFound ${channels.length} matching channels. Please select one:`);
            const chosenAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'chosenChannel',
                    message: 'Select the target channel:',
                    choices: channels.map(c => ({ name: c.name, value: c }))
                }
            ]);
            selectedChannel = chosenAnswer.chosenChannel;
        } else {
            console.log(`✅ Found channel: [${selectedChannel.name}]`);
        }

        // Step 2: Fetch products for the selected channel
        const products = await prisma.channelProduct.findMany({
            where: { channelId: selectedChannel.id },
            select: { id: true, title: true, viewCount: true, likeCount: true }
        });

        if (products.length === 0) {
            console.log('❌ Error: This channel has no products/videos.');
            process.exit(1);
        }

        console.log(`\nFound ${products.length} products in this channel.\n`);

        // Step 3: Ask for metrics
        const metrics = await inquirer.prompt([
            {
                type: 'number',
                name: 'viewsToAdd',
                message: 'How many [VIEWS] do you want to add to EACH product? (Enter 0 to skip):',
                default: 0
            },
            {
                type: 'number',
                name: 'likesToAdd',
                message: 'How many [LIKES] do you want to add to EACH product? (Enter 0 to skip):',
                default: 0
            },
            {
                type: 'number',
                name: 'reviewsToAdd',
                message: 'How many random 5-Star [REVIEWS] do you want to add to EACH product? (Enter 0 to skip):',
                default: 0
            }
        ]);

        console.log('\n🚀 Modifying database... Please wait.\n');

        let updatedProductsCount = 0;
        let addedReviewsCount = 0;

        // Step 4: Add the metrics to each product individually
        for (const product of products) {

            // Increment views and likes directly
            const incrementData: any = {};
            if (metrics.viewsToAdd > 0) incrementData.viewCount = { increment: metrics.viewsToAdd };
            if (metrics.likesToAdd > 0) incrementData.likeCount = { increment: metrics.likesToAdd };

            if (Object.keys(incrementData).length > 0) {
                await prisma.channelProduct.update({
                    where: { id: product.id },
                    data: incrementData
                });
                updatedProductsCount++;
            }

            // Create fake reviews 
            if (metrics.reviewsToAdd > 0) {
                for (let i = 0; i < metrics.reviewsToAdd; i++) {
                    // Ensure Review is unique by generating slightly different text or random UserIds if possible
                    // Since we ONLY need it to render stars on the product card, we can fake the userId by querying any User,
                    // But to be safe from foreign key errors, let's just use the channel's owner userId repeatedly for now
                    const reviewResult = await prisma.productReview.create({
                        data: {
                            productId: product.id,
                            userId: selectedChannel.userId,
                            rating: Math.floor(Math.random() * 2) + 4, // Randomly 4 or 5 stars
                            comment: ['Great content!', 'Highly recommended.', 'Loved it!', 'Amazing quality.', 'Worth the watch!'][Math.floor(Math.random() * 5)],
                        }
                    });
                    if (reviewResult) {
                        addedReviewsCount++;
                    }
                }
            }

            console.log(`✅ Updated: [${product.title}]`);
        }

        console.log('\n======================================');
        console.log('🎉 SUCCESS! Operation Complete.');
        console.log(`-> Processed ${products.length} products.`);
        console.log(`-> Metrics updated successfully: ${updatedProductsCount}`);
        console.log(`-> Added ${addedReviewsCount} fake reviews.`);
        console.log('======================================\n');

    } catch (error) {
        console.error('\n❌ An error occurred:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
