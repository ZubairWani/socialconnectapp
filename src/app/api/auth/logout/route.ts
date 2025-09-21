import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {

        const cookieStore = cookies();
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });

    } catch (error) {
        console.error('LOGOUT_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}