import { create } from "zustand";

import type { User } from "@/models/User";
import type { LoginResponseData } from "@/models/LoginResponseData";

import { loginUser, logoutUser, getUserByEmail } from "@/services/authService";

const TOKEN_KEY = "auth_application";

interface LoginRequestData {
  email: string;
  password: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  login: (
    loginData: LoginRequestData
  ) => Promise<LoginResponseData>;

  logout: (silent?: boolean) => Promise<void>;

  checkLogin: () => boolean;

  fetchCurrentUser: () => Promise<User | null>;

  updateAuthData: (
    accessToken: string,
    user?: User | null
  ) => void;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const useAuthStore = create<AuthState>((set, get) => ({
  // ==========================================
  // INITIAL STATE
  // ==========================================

  accessToken: localStorage.getItem(TOKEN_KEY),

  user: null,

  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  authLoading: false,

  // ==========================================
  // LOGIN
  // ==========================================

  login: async (loginData) => {
    console.log("Login started");

    set({
      authLoading: true,
    });

    try {
      const response = await loginUser(loginData);

      console.log("Login response:", response);

      // Store ONLY access token
      localStorage.setItem(
        TOKEN_KEY,
        response.accessToken
      );

      set({
        accessToken: response.accessToken,
        isAuthenticated: true,
      });

      // Fetch user profile immediately
      await get().fetchCurrentUser();

      return response;
    } catch (error) {
      console.error("Login error:", error);

      throw error;
    } finally {
      set({
        authLoading: false,
      });
    }
  },

  // ==========================================
  // FETCH CURRENT USER
  // ==========================================

  fetchCurrentUser: async () => {
    const token = get().accessToken;
    if (!token) return null;

    try {
      const decoded = parseJwt(token);
      const email = decoded?.email;
      if (!email) return null;

      const userProfile = await getUserByEmail(email);
      set({ user: userProfile });
      return userProfile;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If token is invalid or request fails, logout silently
      await get().logout(true);
      return null;
    }
  },

  // ==========================================
  // UPDATE AUTH DATA
  // Used after refresh token request
  // ==========================================

  updateAuthData: (
    accessToken,
    user = null
  ) => {
    localStorage.setItem(
      TOKEN_KEY,
      accessToken
    );

    set({
      accessToken,
      user: user ?? get().user,
      isAuthenticated: true,
    });
  },

  // ==========================================
  // LOGOUT
  // ==========================================

  logout: async (silent = false) => {
    try {
      if (!silent) {
        await logoutUser();
      }
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      localStorage.removeItem(TOKEN_KEY);

      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
    }
  },

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  checkLogin: () => {
    const {
      accessToken,
      isAuthenticated,
    } = get();

    return (
      !!accessToken &&
      isAuthenticated
    );
  },
}));

export default useAuthStore;