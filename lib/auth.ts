const KEY = "nexo_authenticated";

export function setToken(_token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, "1");
}

export function getToken(): string | null {
  return null;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}
