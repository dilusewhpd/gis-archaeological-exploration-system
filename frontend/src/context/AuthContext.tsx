"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  api,
  AUTH_TOKEN_STORAGE_KEY,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  ApiResponse,
} from "@/lib/api";

export interface UserRole {
  id?: string;
  name: "ADMIN" | "FIELD_OFFICER" | "SENIOR_OFFICER" | "ANALYST" | string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  role: UserRole;
}

interface LoginResponseData {
  user: User;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      setToken(storedToken);
      const res = await api.get<ApiResponse<User>>("/api/auth/me");
      if (res && res.data) {
        setUser(res.data);
        return res.data;
      }
      throw new Error("Failed to load user profile");
    } catch {
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<ApiResponse<User>>("/api/auth/me");
        if (isMounted && res?.data) {
          setUser(res.data);
          setToken(storedToken);
        }
      } catch {
        if (isMounted) {
          removeStoredToken();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    // The `storage` event only fires in OTHER tabs/windows of the same
    // origin, not the one that made the change — so this re-syncs a tab
    // that's been left open when auth_token is cleared or replaced
    // elsewhere (e.g. logging out, or logging in as a different user, in
    // another tab). Without this, a stale tab keeps its old in-memory
    // `user`/`token` until the next full reload.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_TOKEN_STORAGE_KEY || event.storageArea !== localStorage) {
        return;
      }

      if (!event.newValue) {
        setToken(null);
        setUser(null);
        return;
      }

      void (async () => {
        try {
          setToken(event.newValue);
          const res = await api.get<ApiResponse<User>>("/api/auth/me");
          if (isMounted && res?.data) {
            setUser(res.data);
          }
        } catch {
          if (isMounted) {
            removeStoredToken();
            setToken(null);
            setUser(null);
          }
        }
      })();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<ApiResponse<LoginResponseData>>("/api/auth/login", {
      email,
      password,
    });

    const { accessToken, user: loggedInUser } = res.data;
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
