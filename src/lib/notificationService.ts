import { prisma } from './prisma';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'COMMUNITY' | 'SYSTEM' | 'PAYMENT' | 'SITE' | 'SALE';
  metadata?: Record<string, any>;
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.userNotification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        metadata: data.metadata || {}
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function notifyPostAuthor(postId: string, action: 'like' | 'comment', actorName: string) {
  try {
    // Get the post to find the author
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true }
    });

    if (!post || !post.authorId) {
      return;
    }

    const title = action === 'like' ? 'New Like on Your Post' : 'New Comment on Your Post';
    const message = action === 'like' 
      ? `${actorName} liked your post "${post.title}"`
      : `${actorName} commented on your post "${post.title}"`;

    await createNotification({
      userId: post.authorId,
      title,
      message,
      type: 'INFO',
      category: 'COMMUNITY',
      metadata: { postId, action }
    });
  } catch (error) {
    console.error('Error notifying post author:', error);
  }
}

export async function createCommunityNotification(
  userId: string,
  type: 'post_created' | 'comment_received' | 'like_received',
  data: any
) {
  try {
    let title = '';
    let message = '';

    switch (type) {
      case 'post_created':
        title = 'Post Created Successfully';
        message = 'Your community post has been published';
        break;
      case 'comment_received':
        title = 'New Comment';
        message = `Someone commented on your post "${data.postTitle}"`;
        break;
      case 'like_received':
        title = 'New Like';
        message = `Someone liked your post "${data.postTitle}"`;
        break;
    }

    await createNotification({
      userId,
      title,
      message,
      type: 'SUCCESS',
      category: 'COMMUNITY',
      metadata: { type, ...data }
    });
  } catch (error) {
    console.error('Error creating community notification:', error);
  }
}
