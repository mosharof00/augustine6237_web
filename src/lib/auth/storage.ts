export const ACCESS_TOKEN_KEY = "wop.accessToken";

export function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.localStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function writeAccessToken(token: string, remember = false) {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  const store = remember ? window.localStorage : window.sessionStorage;
  store.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
