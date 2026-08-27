import axios, {
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";

import useAuthStore from "@/auth/authStore";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8083/api/v1",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// =====================================================
// REFRESH STATE
// =====================================================

let isRefreshing = false;

let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// =====================================================
// QUEUE
// =====================================================

const addPendingRequest = (
  resolve: (token: string) => void,
  reject: (error: unknown) => void
) => {
  pendingRequests.push({
    resolve,
    reject,
  });
};

// =====================================================
// RESOLVE QUEUE
// =====================================================

const resolvePendingRequests = (
  token: string
) => {
  pendingRequests.forEach(
    ({ resolve }) => {
      resolve(token);
    }
  );

  pendingRequests = [];
};

// =====================================================
// REJECT QUEUE
// =====================================================

const rejectPendingRequests = (
  error: unknown
) => {
  pendingRequests.forEach(
    ({ reject }) => {
      reject(error);
    }
  );

  pendingRequests = [];
};

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | AxiosRequestConfig
        | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status =
      error.response?.status;

    // ==========================================
    // ONLY 401
    // ==========================================

    if (status !== 401) {
      return Promise.reject(error);
    }

    const url =
      originalRequest.url || "";

    // ==========================================
    // AUTH ENDPOINTS
    // ==========================================

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // ==========================================
    // ALREADY RETRIED
    // ==========================================

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ==========================================
    // REFRESH ALREADY RUNNING
    // ==========================================

    if (isRefreshing) {
      console.log(
        "Already refreshing - adding request to queue"
      );

      return new Promise(
        (resolve, reject) => {
          addPendingRequest(
            (newToken) => {
              originalRequest._retry =
                true;

              originalRequest.headers = {
                ...originalRequest.headers,

                Authorization:
                  `Bearer ${newToken}`,
              };

              resolve(
                apiClient(originalRequest)
              );
            },

            reject
          );
        }
      );
    }

    // ==========================================
    // START REFRESH
    // ==========================================

    isRefreshing = true;

    console.log(
      "Starting token refresh..."
    );

    try {
      // ========================================
      // REFRESH TOKEN API
      // ========================================

      const response =
        await apiClient.post(
          "/auth/refresh",
          {}
        );

      const newAccessToken =
        response.data?.accessToken;

      // ========================================
      // CHECK TOKEN
      // ========================================

      if (!newAccessToken) {
        throw new Error(
          "No access token received"
        );
      }

      console.log(
        "New access token received"
      );

      // ========================================
      // UPDATE ZUSTAND
      // ========================================

      const currentUser =
        useAuthStore.getState().user;

      useAuthStore
        .getState()
        .updateAuthData(
          newAccessToken,
          currentUser
        );

      // ========================================
      // RESOLVE QUEUE
      // ========================================

      resolvePendingRequests(
        newAccessToken
      );

      // ========================================
      // RETRY ORIGINAL REQUEST
      // ========================================

      originalRequest._retry = true;

      originalRequest.headers = {
        ...originalRequest.headers,

        Authorization:
          `Bearer ${newAccessToken}`,
      };

      return apiClient(
        originalRequest
      );
    } catch (refreshError) {
      console.error(
        "Refresh token failed:",
        refreshError
      );

      // ========================================
      // REJECT QUEUE
      // ========================================

      rejectPendingRequests(
        refreshError
      );

      // ========================================
      // LOGOUT
      // ========================================

      await useAuthStore
        .getState()
        .logout(true);

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;

      console.log(
        "Refresh process finished"
      );
    }
  }
);

export default apiClient;