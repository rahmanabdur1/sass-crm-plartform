"use client";
import { useEffect, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useCompanyStore } from "../store/companyStore";
import { authService } from "../services/authService";
import { db } from "../db/schema";
import { LoginCredentials } from "../types/auth.types";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, logout: storeLogout, setLoading } = useAuthStore();
  const { setActiveCompany, setCompanies, reset: resetCompany } = useCompanyStore();
  const router = useRouter();

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      await authService.initialize();
      const currentUser = await authService.getCurrentUser();
      const storedToken = authService.getStoredToken();

      if (currentUser && storedToken) {
        setUser(currentUser);
        setToken(storedToken);

        // Load companies
        const allCompanies = await db.companies.toArray();
        setCompanies(allCompanies);

        const activeCompany = allCompanies.find(
          (c) => c.id === currentUser.companyId
        );
        if (activeCompany) setActiveCompany(activeCompany);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setActiveCompany, setCompanies]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { user: u, token: t } = await authService.login(credentials);
      setUser(u);
      setToken(t);

      const allCompanies = await db.companies.toArray();
      setCompanies(allCompanies);

      const company = allCompanies.find((c) => c.id === u.companyId);
      if (company) setActiveCompany(company);

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setActiveCompany, setCompanies, router]);

  const logout = useCallback(async () => {
    if (user) {
      await authService.logout(user.id, user.companyId, user.name);
    }
    storeLogout();
    resetCompany();
    router.push("/login");
  }, [user, storeLogout, resetCompany, router]);

  return { user, token, isAuthenticated, isLoading, login, logout, initialize };
}