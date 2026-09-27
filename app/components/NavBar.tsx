"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
export function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Smart Car Parking System
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user && (
            <Link href="/availability" className="text-slate-600 hover:text-slate-900">
              Availability
            </Link>
          )}

          {user && (user.role === "ADMIN" || user.role === "GATE_OPERATOR") && (
            <Link href="/gate" className="text-slate-600 hover:text-slate-900">
              Gate Desk
            </Link>
          )}

          {user && user.role === "ADMIN" && (
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                {user.username} &middot; {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-slate-900 px-3 py-1 text-white hover:bg-slate-700"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}