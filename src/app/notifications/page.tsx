import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/outline";

export const metadata = {
    title: "Notifications | Sed Studios",
    description: "View all your notifications",
};

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const unreadCount = await prisma.userNotification.count({
        where: { userId: session.user.id, read: false }
    });

    const dbNotifications = await prisma.userNotification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    const notifications = dbNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt.toLocaleString(),
        read: n.read,
        type: n.type,
        metadata: n.metadata as any
    }));

    return (
        <MainLayout isDarkTheme={true}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white">
                            <BellIcon className="w-8 h-8 text-indigo-400" />
                            Notifications
                        </h1>
                        <p className="text-gray-400 mt-1 font-medium">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                                : "You're all caught up!"}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl">
                            <BellIcon className="w-12 h-12 mx-auto text-gray-600 mb-3 opacity-50" />
                            <h2 className="text-xl font-bold mb-1 text-white">No notifications yet</h2>
                            <p className="text-gray-500 text-sm">We'll let you know when something important happens.</p>
                        </div>
                    ) : (
                        notifications.map((note) => {
                            const hasLink = note.metadata && note.metadata.url;
                            const noteContent = (
                                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${!note.read
                                    ? "bg-[#1e1e1e] shadow-sm border-indigo-500/30"
                                    : "bg-[#181818] opacity-70 border-white/5"
                                    }`}>
                                    <div className="flex gap-4">
                                        <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${!note.read ? "bg-indigo-500" : "bg-gray-600"}`} />
                                        <div className="flex-1">
                                            <h3 className={`text-base font-bold ${!note.read ? "text-white" : "text-gray-400"}`}>
                                                {note.title}
                                            </h3>
                                            <p className={`text-sm mt-1 sm:text-base ${!note.read ? "text-gray-300" : "text-gray-500"}`}>
                                                {note.message}
                                            </p>
                                            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mt-3">
                                                {note.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );

                            return (
                                <div key={note.id} className="block relative group">
                                    {hasLink ? (
                                        <Link href={note.metadata.url} className="block">
                                            {noteContent}
                                        </Link>
                                    ) : (
                                        noteContent
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
