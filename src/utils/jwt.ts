import { AuthToken } from "../types/auth.types";

const SECRET = "saas_jwt_secret_key_2024";
const EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateToken(payload: Omit<AuthToken, "exp" | "iat">): string {
  const token: AuthToken = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + EXPIRY,
  };
  return btoa(JSON.stringify(token) + "." + SECRET);
}

export function decodeToken(token: string): AuthToken | null {
  try {
    const [payloadStr] = atob(token).split("." + SECRET);
    const parsed = JSON.parse(payloadStr) as AuthToken;
    if (parsed.exp < Date.now()) return null; // expired
    return parsed;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  return decodeToken(token) !== null;
}

export const TOKEN_KEY = "saas_auth_token";
export const COMPANY_KEY = "saas_active_company";
export const THEME_KEY = "saas_theme";
export const ONBOARD_KEY = "saas_onboarded";