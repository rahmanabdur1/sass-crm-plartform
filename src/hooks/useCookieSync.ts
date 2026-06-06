"use client";
import { useEffect } from "react";
import { TOKEN_KEY } from "@/utils/jwt";

export function useCookieSync() {
  useEffect(() => {
    function syncTokenToCookie() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        document.cookie = `saas_auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      } else {
        document.cookie = "saas_auth_token=; path=/; max-age=0";
      }
    }

    syncTokenToCookie();

    // Sync on storage change (cross-tab)
    window.addEventListener("storage", syncTokenToCookie);
    return () => window.removeEventListener("storage", syncTokenToCookie);
  }, []);
}