// src/app/api/notifications/route.ts

import { NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
/**
 * GET /api/notifications
 * Fetches notifications for the authenticated user with pagination.
 * Also returns the total unread count.
 */
export async function GET(request: Request) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authPayload.userId;

    const { searchParams } = new URL(request.url);
    // Support pagination: ?page=1&limit=20
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Fetch the notifications for the current page
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        // Include the post content for context in 'Like' and 'Comment' notifications
        post: {
          select: {
            content: true,
          },
        },
      },
    });

    // Fetch the unread count separately, as it's independent of pagination
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GET_NOTIFICATIONS_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Marks all unread notifications for the authenticated user as read.
 */
export async function PATCH() {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: authPayload.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new NextResponse(null, { status: 204 }); // Success, no content
  } catch (error) {
    console.error('MARK_NOTIFICATIONS_READ_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}