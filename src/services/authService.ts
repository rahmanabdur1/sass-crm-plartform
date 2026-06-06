import { db } from "../db/schema";
import { LoginCredentials, User, AuthToken } from "../types/auth.types";
import { verifyPassword } from "../utils/crypto";
import { generateToken, decodeToken, TOKEN_KEY } from "../utils/jwt";
// import { generateId } from "@/utils/generateId";
import { seedDatabase } from "../db/seeds/seedData";
import { auditService } from "./auditService";

class AuthService {
  async initialize(): Promise<void> {
    await seedDatabase();
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: AuthToken }> {
    const user = await db.users
      .where("email")
      .equals(credentials.email)
      .first();

    if (!user) throw new Error("Invalid email or password");
    if (!user.isActive) throw new Error("Account is deactivated");

    const valid = await verifyPassword(credentials.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      permissions: user.permissions,
    };

    const tokenString = generateToken(tokenPayload);
    const token = decodeToken(tokenString)!;

    localStorage.setItem(TOKEN_KEY, tokenString);

    await db.users.update(user.id, { lastLoginAt: Date.now() });

    await auditService.log({
      companyId: user.companyId,
      actorId: user.id,
      actorName: user.name,
      action: "user.login",
      target: "auth",
    });

    return { user, token };
  }

  async logout(userId: string, companyId: string, userName: string): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);

    await auditService.log({
      companyId,
      actorId: userId,
      actorName: userName,
      action: "user.logout",
      target: "auth",
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (!tokenString) return null;

    const token = decodeToken(tokenString);
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return await db.users.get(token.userId) || null;
  }

  getStoredToken(): AuthToken | null {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (!tokenString) return null;
    return decodeToken(tokenString);
  }
}

export const authService = new AuthService();