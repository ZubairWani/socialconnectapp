import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
    throw new Error('Missing environment variable JWT_SECRET');
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};


export const generateTokens = (user: { id: string, role: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // long-lived access token
  );

  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};


export const verifyToken = (token: string): { userId: string, role: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as { userId: string, role: string };
    } catch (error) {
        return null;
    }
}


export const getAuthPayload = (request: NextRequest): { userId: string, role: string } | null => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    return verifyToken(token);
}


interface AuthPayload {
  userId: string;
  role: string;
}

export const getAuthPayloadFromCookie = async (): Promise<AuthPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const payload = await verifyToken(accessToken) as AuthPayload;
    return payload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};