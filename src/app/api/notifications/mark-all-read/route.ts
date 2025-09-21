import { NextResponse, NextRequest } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/notifications/mark-all-read
 * Marks all unread notifications as read for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const authPayload = getAuthPayload(request);
    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authPayload;

    // Use updateMany to efficiently update all matching records
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false, // Only target unread notifications
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: `Successfully marked ${result.count} notifications as read.` });
  } catch (error) {
    console.error('MARK_ALL_READ_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}