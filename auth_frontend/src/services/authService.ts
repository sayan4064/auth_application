import apiClient from "./apiClient";

import type { LoginResponseData } from "@/models/LoginResponseData";
import type { RegisterData } from "@/models/RegisterData";
import type { User } from "@/models/User";

export interface LoginRequestData {
  email: string;
  password: string;
}

// =====================================================
// GET USER BY EMAIL
// =====================================================

export const getUserByEmail = async (
  email: string
): Promise<User> => {
  const response =
    await apiClient.get(
      `/users/email/${email}`
    );

  return response.data;
};

// =====================================================
// REGISTER
// =====================================================

export const registerUser = async (
  registerData: RegisterData
) => {
  const response =
    await apiClient.post(
      "/auth/register",
      registerData
    );

  return response.data;
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (
  loginData: LoginRequestData
): Promise<LoginResponseData> => {
  const response =
    await apiClient.post(
      "/auth/login",
      loginData
    );

  return response.data;
};

// =====================================================
// REFRESH TOKEN
// =====================================================

export const refreshToken =
  async (): Promise<LoginResponseData> => {
    const response =
      await apiClient.post(
        "/auth/refresh",
        {}
      );

    return response.data;
  };

// =====================================================
// LOGOUT
// =====================================================

export const logoutUser =
  async () => {
    const response =
      await apiClient.post(
        "/auth/logout"
      );

    return response.data;
  };