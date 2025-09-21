// src/app/api/admin/users/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthPayloadFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
    params: { userId: string };
}

// Zod schema to validate the request body
const updateUserSchema = z.object({
    isActive: z.boolean(),
});

/**
 * PATCH /api/admin/users/[userId]
 * Updates a user's status (e.g., deactivates them).
 * Protected route: Requires Admin role.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
    try {
        const authPayload = await getAuthPayloadFromCookie();
        if (!authPayload || authPayload.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { userId } = params;

        // Security check: Prevent an admin from deactivating their own account
        if (authPayload.userId === userId) {
            return NextResponse.json({ message: 'Admins cannot change their own status.' }, { status: 400 });
        }

        const body = await req.json();
        const validation = updateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten() }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: validation.data.isActive },
            select: { id: true, isActive: true }, 
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('ADMIN_UPDATE_USER_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}