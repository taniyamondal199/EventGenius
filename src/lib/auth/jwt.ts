import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eventgenius-enterprise-jwt-super-secure-key-32chars-min-2025";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function signJwtToken(payload: TokenPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
