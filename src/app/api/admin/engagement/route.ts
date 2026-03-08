import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Trigger Engagement Notifications & Emails to Random Users.
 * Method: POST
 * Body payload: { targetCount?: number, type: "RECOMMENDATION" | "REMINDER" | "UPDATE" }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Security check (ideally check for ADMIN role, assuming any logged-in dev for now)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const targetCount = body.targetCount || 5;
        const engagementType = body.type || "RECOMMENDATION";

        // Grab a few random users 
        const users = await prisma.user.findMany({
            take: targetCount,
            orderBy: {
                // In PostgreSQL, you can use raw queries for true random, but this simulates picking some users quickly
                createdAt: "desc"
            }
        });

        if (users.length === 0) {
            return NextResponse.json({ error: "No users found to engage" }, { status: 400 });
        }

        let notificationsCreated = 0;

        // Loop through and engage
        for (const user of users) {
            let title = "Check out what's new!";
            let message = "We have some exciting updates waiting for you.";
            let url = "/explore";

            if (engagementType === "RECOMMENDATION") {
                // Example: Recommend a trending product
                const topProduct = await prisma.channelProduct.findFirst({
                    where: { published: true, status: "ACTIVE" },
                    orderBy: { purchaseCount: "desc" },
                    include: { channel: true }
                });

                if (topProduct) {
                    title = "Recommended just for you 🔥";
                    message = `You might love "${topProduct.title}" from ${topProduct.channel.name}. Come take a look!`;
                    url = `/channel/${topProduct.channel.slug}/products/${topProduct.id}`;
                }
            } else if (engagementType === "REMINDER") {
                title = "We miss you!";
                message = "Your dashboard is waiting. Click here to see your recent stats.";
                url = "/auth/dashboard";
            }

            // Create In-App Notification
            await prisma.userNotification.create({
                data: {
                    userId: user.id,
                    title,
                    message,
                    type: "INFO",
                    category: "COMMUNITY",
                    read: false,
                    metadata: { url }
                }
            });

            notificationsCreated++;

            // ==========================================
            // EMAIL SENDING STUB 📧
            // ==========================================
            // If you install 'nodemailer', 'resend', or 'sendgrid', you would fire the email here format. 
            // Example using Resend:
            /*
            await resend.emails.send({
                from: 'Sed Studios <updates@yourdomain.com>',
                to: user.email,
                subject: title,
                html: `<p>Hi ${user.name},</p><p>${message}</p><a href="https://yourdomain.com${url}">Click here</a>`
            });
            */
            console.log(`[Email Mock Sent] To: ${user.email} | Subject: ${title} | Link: ${url}`);
        }

        return NextResponse.json({
            success: true,
            message: `Engagement campaign sent to ${notificationsCreated} users.`,
            type: engagementType
        });
    } catch (error) {
        console.error("Engagement campaign error:", error);
        return NextResponse.json({ error: "Failed to send engagement campaign" }, { status: 500 });
    }
}
