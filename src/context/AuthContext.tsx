/* eslint-disable react-refresh/only-export-components */
"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { UserEntity } from "../common/services/user/user";
import { AuthEntity } from "../common/services/auth/auth";
import { ServiceBase } from "../common/services/servicebase";
import {
  parseJwt,
  scheduleTokenRefresh,
} from "../common/function/commonFunction";
import { authService } from "../common/services/auth/authService";
import { encodeBase64 } from "../components/constant/constant";

interface AuthContextType {
  currentUser: UserEntity | undefined;
  token: string | undefined;
  login: (dataLogin: AuthEntity, passWord: string) => Promise<void>;
  setNewCuruser: (curUser: UserEntity | undefined) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserEntity | undefined>(
    undefined
  );
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("currentUser");
    const refreshToken = localStorage.getItem("refresh_token");

    const initAuth = async () => {
      if (savedToken && savedUser) {
        const { exp } = parseJwt(savedToken);
        const now = Date.now();

        if (exp * 1000 > now) {
          try {
            const currentUser = JSON.parse(savedUser);
            setToken(savedToken);
            setCurrentUser(currentUser);
            scheduleTokenRefresh(savedToken);
          } catch (e) {
            console.log(e);
          }
        } else {
          if (refreshToken) {
            try {
              const res = await authService.refresh(refreshToken);

              ServiceBase.setToken(res.token);
              setToken(res.token);
              setCurrentUser(res.user);

              localStorage.setItem("access_token", res.token);
              localStorage.setItem("refresh_token", res.refreshToken);
              localStorage.setItem("currentUser", JSON.stringify(res.user));

              scheduleTokenRefresh(res.token);
            } catch (e) {
              console.error("Refresh failed", e);
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = "/signin";
            }
          } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/signin";
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setNewCuruser = (curUser: UserEntity | undefined) => {
    setCurrentUser(curUser);
    localStorage.setItem("currentUser", JSON.stringify(curUser));
  };

  const login = async (dataLogin: AuthEntity, passWord: string) => {
    setToken(dataLogin.token);
    sessionStorage.setItem("user_password", encodeBase64(passWord));
    ServiceBase.setToken(dataLogin.token);
    localStorage.setItem("access_token", dataLogin.token);
    localStorage.setItem("refresh_token", dataLogin.refreshToken);
    try {
      const currentUser = await authService.me();
      setCurrentUser(currentUser);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } catch (e) {
      console.log("Không lấy được thông tin user", e);
      setCurrentUser(dataLogin.user);
      localStorage.setItem("currentUser", JSON.stringify(dataLogin.user));
    }

    scheduleTokenRefresh(dataLogin.token);

    ServiceBase.setTokenRefresher(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return;
      const res = await authService.refresh(refreshToken);

      ServiceBase.setToken(res.token);
      setToken(res.token);

      localStorage.setItem("access_token", res.token);
      localStorage.setItem("refresh_token", res.refreshToken);

      scheduleTokenRefresh(res.token);
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.log(e);
    }
    setToken(undefined);
    setCurrentUser(undefined);
    ServiceBase.setToken(undefined);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("user_password");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        setNewCuruser,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
