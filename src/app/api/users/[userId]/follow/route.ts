// import { NextResponse } from 'next/server';
// import { getAuthPayload } from '@/lib/auth';
// import prisma from '@/lib/prisma';

// /**
//  * POST /api/users/{userId}/follow
//  * Allows the authenticated user to follow another user.
//  */
// export async function POST(request: Request, { params }: { params: { userId: string } }) {
//   try {
//     const authPayload = getAuthPayload(request as any);
//     console.log("ap: ", authPayload)
//     if (!authPayload) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     const { userId: targetUserId } = params;
//     const followerId = authPayload.userId;

//     if (targetUserId === followerId) {
//       return NextResponse.json({ message: 'You cannot follow yourself.' }, { status: 400 });
//     }

//     // Check if the follow relationship already exists
//     const existingFollow = await prisma.follow.findUnique({
//       where: {
//         followerId_followingId: {
//           followerId: followerId,
//           followingId: targetUserId,
//         },
//       },
//     });

//     if (existingFollow) {
//       return NextResponse.json({ message: 'You are already following this user.' }, { status: 409 });
//     }

//     // Use a transaction to ensure both operations succeed or fail together
//     await prisma.$transaction([
//       // 1. Create the follow relationship
//       prisma.follow.create({
//         data: {
//           followerId: followerId,
//           followingId: targetUserId,
//         },
//       }),
//       // 2. Increment the follower's following count
//       prisma.user.update({
//         where: { id: followerId },
//         data: { followingCount: { increment: 1 } },
//       }),
//       // 3. Increment the target user's followers count
//       prisma.user.update({
//         where: { id: targetUserId },
//         data: { followersCount: { increment: 1 } },
//       }),
//     ]);

//     // TODO: Create a "new follower" notification

//     return NextResponse.json({ message: 'Successfully followed user.' }, { status: 201 });
//   } catch (error) {
//     console.error('FOLLOW_USER_ERROR', error);
//     return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
//   }
// }

// /**
//  * DELETE /api/users/{userId}/follow
//  * Allows the authenticated user to unfollow another user.
//  */
// export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
//   try {
//     const authPayload = getAuthPayload(request as any);
//     if (!authPayload) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     const { userId: targetUserId } = params;
//     const followerId = authPayload.userId;

//     // Use a transaction to ensure atomicity
//     const result = await prisma.$transaction([
//         // 1. Delete the follow relationship
//         prisma.follow.delete({
//             where: {
//                 followerId_followingId: {
//                     followerId: followerId,
//                     followingId: targetUserId,
//                 },
//             },
//         }),
//         // 2. Decrement the follower's following count
//         prisma.user.update({
//             where: { id: followerId },
//             data: { followingCount: { decrement: 1 } },
//         }),
//         // 3. Decrement the target user's followers count
//         prisma.user.update({
//             where: { id: targetUserId },
//             data: { followersCount: { decrement: 1 } },
//         }),
//     ]);

//     return NextResponse.json({ message: 'Successfully unfollowed user.' }, { status: 200 });

//   } catch (error) {
//     // Prisma throws an error if the record to be deleted is not found
//     if (error.code === 'P2025') {
//         return NextResponse.json({ message: 'You are not following this user.' }, { status: 404 });
//     }
//     console.error('UNFOLLOW_USER_ERROR', error);
//     return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma  from '@/lib/prisma';

interface RouteContext {
  params: {
    userId: string;
  };
}

/**
 * POST /api/users/[userId]/follow
 * Follows a user.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    const { userId: userIdToFollow } = params;

    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = authPayload.userId;

    if (currentUserId === userIdToFollow) {
      return NextResponse.json({ message: 'You cannot follow yourself.' }, { status: 400 });
    }

    // Check if the follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ message: 'You are already following this user.' }, { status: 409 }); // 409 Conflict
    }

    // Create the follow relationship
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userIdToFollow,
      },
    });

    return NextResponse.json({ message: 'Successfully followed user.' }, { status: 201 });
  } catch (error) {
    console.error('FOLLOW_USER_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[userId]/follow
 * Unfollows a user.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const authPayload = await getAuthPayloadFromCookie();
    const { userId: userIdToUnfollow } = params;

    if (!authPayload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = authPayload.userId;

    // Delete the follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToUnfollow,
        },
      },
    });

    return NextResponse.json({ message: 'Successfully unfollowed user.' }, { status: 200 });
  } catch (error) {
    // Handle cases where the record to delete doesn't exist gracefully
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'You are not following this user.' }, { status: 404 });
    }
    console.error('UNFOLLOW_USER_ERROR', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}