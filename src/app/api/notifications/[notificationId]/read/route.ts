import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/notifications/{notificationId}/read
 * Marks a single notification as read for the authenticated user.
 */
export async function POST(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    const authPayload = getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = params;
    const { userId } = authPayload;

    // Find the notification to ensure it belongs to the user making the request
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    // Security check: ensure the user is the recipient of the notification
    if (notification.recipientId !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Update the notification status
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('MARK_NOTIFICATION_READ_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}