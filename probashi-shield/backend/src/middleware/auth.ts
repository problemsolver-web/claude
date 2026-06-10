import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/helpers";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = header.substring(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restrict a route to specific user types.
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
}

export const requireAdmin = requireRole("admin", "super_admin");

// Attaches req.user if a valid token is present, but does NOT block the request
// if it's missing/invalid. Used for endpoints that work anonymously but can
// personalise when the user happens to be logged in (e.g. fraud reports).
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(header.substring(7));
    } catch {
      // ignore invalid token, continue as anonymous
    }
  }
  next();
}
