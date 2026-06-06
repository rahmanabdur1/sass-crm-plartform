"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useUIStore } from "../store/uiStore";

interface ProvidersProps {
  children: React.ReactNode;
}

interface ThemeState {
  theme: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const theme = useUIStore((s: ThemeState) => s.theme);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (!mounted) return null;

  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}