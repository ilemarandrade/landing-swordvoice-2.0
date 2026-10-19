"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { createQueryClient } from "@/common/api/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      {children}
    </QueryClientProvider>
  );
}
