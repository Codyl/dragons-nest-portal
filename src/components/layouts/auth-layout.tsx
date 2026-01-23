import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function AuthLayout({
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      {children}
    </div>
  );
}
