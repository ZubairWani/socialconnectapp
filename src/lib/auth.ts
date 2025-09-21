import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
    throw new Error('Missing environment variable JWT_SECRET');
}

/**
 * Hashes a password using bcrypt.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verifies a plaintext password against a hashed password.
 * @param password The plaintext password.
 * @param hashedPassword The hashed password from the database.
 * @returns A promise that resolves to a boolean indicating if the password is valid.
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generates JWT access and refresh tokens for a user.
 * @param user The user object to create tokens for.
 * @returns An object containing the accessToken and refreshToken.
 */
export const generateTokens = (user: { id: string, role: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};


/**
 * Verifies a JWT and returns its payload.
 * @param token The JWT string.
 * @returns The decoded payload or null if invalid.
 */
export const verifyToken = (token: string): { userId: string, role: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as { userId: string, role: string };
    } catch (error) {
        return null;
    }
}

/**
 * [INCORRECT for this use case] Extracts and verifies the JWT from an Authorization header.
 * This does not work for requests from the browser that use httpOnly cookies.
 * @param request The NextRequest object.
 * @returns The decoded token payload or null if not found or invalid.
 */
export const getAuthPayload = (request: NextRequest): { userId: string, role: string } | null => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    return verifyToken(token);
}


/**
 * [CORRECT] Extracts and verifies the JWT from the 'accessToken' httpOnly cookie.
 * This is the secure way to authenticate server-side requests originating from the browser.
 * @returns The decoded token payload or null if not found or invalid.
 */
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