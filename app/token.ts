// The access token lives here — a plain module-level variable — NOT in
// localStorage or a cookie the frontend can read. This is deliberate:
// it limits what an XSS bug could steal, matching the backend's design
// (see accounts/views.py comments on the refresh cookie). The refresh
// token is an httpOnly cookie the browser sends automatically; this
// file never sees it.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}