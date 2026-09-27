import { api } from "../api";
import { setAccessToken } from "../token";
import { User } from "./types";
interface AuthResponse {
  user: User;
  access: string;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>("/api/auth/login/", { username, password });
  setAccessToken(res.data.access);
  return res.data.user;
}

export async function registerDriver(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const res = await api.post<AuthResponse>("/api/auth/register/", { username, email, password });
  setAccessToken(res.data.access);
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout/");
  setAccessToken(null);
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<User>("/api/auth/me/");
  return res.data;
}

/**
 * Called once when the app boots. Uses the httpOnly refresh cookie
 * (if the browser has one from a previous visit) to get a fresh
 * access token, then fetches the user. Returns null if there is no
 * valid session — this is the normal "not logged in yet" case, not
 * an error.
 */
export async function bootstrapSession(): Promise<User | null> {
  try {
    const refreshRes = await api.post<{ access: string }>("/api/auth/refresh/");
    setAccessToken(refreshRes.data.access);
    return await fetchMe();
  } catch {
    setAccessToken(null);
    return null;
  }
}