import type { Request, Response, NextFunction } from 'express';
import { verifyToken, createClerkClient } from '@clerk/backend';

const secretKey = process.env.CLERK_SECRET_KEY?.trim();

export const clerkClient = secretKey
  ? createClerkClient({ secretKey })
  : null;

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    sessionClaims: Record<string, unknown>;
  };
}

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!secretKey || !clerkClient) {
    res.status(503).json({ error: 'CLERK_SECRET_KEY is not configured on the server.' });
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing session token.' });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    const userId = payload.sub;
    if (!userId) {
      res.status(401).json({ error: 'Invalid session token.' });
      return;
    }

    (req as AuthenticatedRequest).auth = {
      userId,
      sessionClaims: payload as unknown as Record<string, unknown>,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function getUserRole(req: Request): string | undefined {
  const auth = (req as AuthenticatedRequest).auth;
  const claims = auth?.sessionClaims ?? {};
  const publicMetadata =
    (claims.publicMetadata as { role?: string } | undefined) ??
    (claims.public_metadata as { role?: string } | undefined);
  return publicMetadata?.role;
}

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = getUserRole(req);
    if (!role || !allowed.includes(role)) {
      res.status(403).json({ error: 'Insufficient role.' });
      return;
    }
    next();
  };
}
