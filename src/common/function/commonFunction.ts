import { authService } from "../services/auth/authService";
import { ServiceBase } from "../services/servicebase";

export const parseJwt = (token: string): { exp: number } => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

let refreshTimer: number;

export const scheduleTokenRefresh = (token: string) => {
  const { exp } = parseJwt(token);
  const expiresIn = exp * 1000 - Date.now();
  const refreshBefore = expiresIn - 30_000;

  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = setTimeout(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return;

      const res = await authService.refresh(refreshToken);

      ServiceBase.setToken(res.token);
      localStorage.setItem("access_token", res.token);
      localStorage.setItem("refresh_token", res.refreshToken);

      scheduleTokenRefresh(res.token);
    } catch (e) {
      console.error("Refresh failed", e);
      localStorage.clear();
      window.location.href = "/signin";
    }
  }, refreshBefore);
};
