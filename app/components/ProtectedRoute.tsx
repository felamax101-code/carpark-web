"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Role } from "../lib/types";
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/availability");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-slate-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}