/**
 * API Client Module
 *
 * Purpose:
 * - Resolves environment-aware API base URL for Expo/Web/Android emulator
 * - Provides a shared Axios client with structured request/response logging
 * - Redacts sensitive data from logs and maps transport errors to UI-safe text
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = 5500;
const isDebug = process.env.NODE_ENV === "development";

type AuthLifecycleHandlers = {
  getAccessToken?: () => string | null;
  refreshAccessToken?: () => Promise<string | null>;
  onAuthFailure?: () => Promise<void> | void;
};

const authLifecycleHandlers: AuthLifecycleHandlers = {};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

/**
 * Removes trailing slashes to normalize URL composition.
 */
const trimTrailingSlash = (value: unknown) => String(value ?? "").replace(/\/+$/, "");

/**
 * Ensures protocol presence for host values provided through env/config.
 */
const ensureProtocol = (value: unknown) => {
  const safeValue = String(value ?? "").trim();
  if (!safeValue) {
    return "";
  }
  if (/^https?:\/\//i.test(safeValue)) {
    return safeValue;
  }
  return `http://${safeValue}`;
};

/**
 * Applies protocol and slash normalization to derive a stable base URL value.
 */
const sanitizeBaseUrl = (value: unknown) => {
  return trimTrailingSlash(ensureProtocol(value));
};

/**
 * Checks whether a URL points to localhost-style hostnames.
 */
const isLocalhostHost = (value: unknown) => {
  return /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(String(value ?? ""));
};

/**
 * Detects Android emulator runtime to remap localhost access.
 */
const isAndroidEmulator = () => {
  return Platform.OS === "android" && !Constants.isDevice;
};

/**
 * Returns a human-readable runtime label for diagnostics.
 */
const getDeviceTypeLabel = () => {
  if (Platform.OS === "web") {
    return "web";
  }
  if (Platform.OS === "android") {
    return isAndroidEmulator() ? "android-emulator" : "android-device";
  }
  if (Platform.OS === "ios") {
    return Constants.isDevice ? "ios-device" : "ios-simulator";
  }
  return "unknown-device";
};

/**
 * Safely concatenates a base URL and endpoint path.
 */
const joinUrl = (baseURL: unknown = "", url: unknown = "") => {
  const safeBaseInput = String(baseURL ?? "");
  const safeUrlInput = String(url ?? "");

  if (!safeBaseInput) {
    return safeUrlInput;
  }
  if (!safeUrlInput) {
    return safeBaseInput;
  }
  if (/^https?:\/\//i.test(safeUrlInput)) {
    return safeUrlInput;
  }

  const safeBase = trimTrailingSlash(safeBaseInput);
  const safePath = safeUrlInput.startsWith("/") ? safeUrlInput : `/${safeUrlInput}`;
  return `${safeBase}${safePath}`;
};

/**
 * Reads Expo host metadata so physical devices can reach local backend.
 */
const getHostFromExpo = (): string | null => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any)?.manifest?.debuggerHost;

    if (!hostUri || typeof hostUri !== "string") {
      return null;
    }

    const host = hostUri.split(":")[0];
    return host || null;
  } catch (error) {
    console.warn('[API] Failed to read Expo host URI, using fallback URL.', error);
    return null;
  }
};

/**
 * Rewrites localhost hostnames to Android emulator loopback bridge.
 */
const replaceAndroidEmulatorLocalhost = (urlValue: string) => {
  try {
    const parsedUrl = new URL(urlValue);
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
      parsedUrl.hostname = "10.0.2.2";
      return trimTrailingSlash(parsedUrl.toString());
    }
    return trimTrailingSlash(parsedUrl.toString());
  } catch {
    return urlValue;
  }
};

/**
 * Resolves best-effort API base URL across env override, Expo host, and local fallbacks.
 */
export const resolveApiBaseUrl = () => {
  try {
    const configured = process.env.EXPO_PUBLIC_API_URL;
    if (configured) {
      const normalized = sanitizeBaseUrl(configured);
      const resolved =
        isAndroidEmulator() && isLocalhostHost(normalized)
          ? replaceAndroidEmulatorLocalhost(normalized)
          : normalized;

      console.log("[API BASE URL]", resolved);
      console.log("[API DEVICE]", getDeviceTypeLabel());
      return resolved;
    }

    const expoHost = getHostFromExpo();
    if (expoHost) {
      const resolved = `http://${expoHost}:${DEFAULT_API_PORT}/api/v1`;
      console.log("[API BASE URL]", resolved);
      console.log("[API DEVICE]", getDeviceTypeLabel());
      return resolved;
    }

    const androidEmulatorFallback = `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1`;
    const localhostFallback = `http://localhost:${DEFAULT_API_PORT}/api/v1`;
    const resolved = Platform.OS === "android" ? androidEmulatorFallback : localhostFallback;

    console.log("[API BASE URL]", resolved);
    console.log("[API DEVICE]", getDeviceTypeLabel());
    return resolved;
  } catch (error) {
    const fallback = Platform.OS === 'android'
      ? `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1`
      : `http://localhost:${DEFAULT_API_PORT}/api/v1`;
    console.warn('[API] Failed to resolve base URL. Falling back to safe default.', error);
    console.log("[API BASE URL]", fallback);
    console.log("[API DEVICE]", getDeviceTypeLabel());
    return fallback;
  }
};

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Redacts sensitive request headers before log emission.
 */
const sanitizeHeaders = (headers: Record<string, any> | undefined) => {
  if (!headers) {
    return headers;
  }

  const next = { ...headers };
  const lowerCaseHeaderMap: Record<string, string> = {
    authorization: "Authorization",
    cookie: "Cookie",
    "set-cookie": "Set-Cookie",
  };

  Object.entries(lowerCaseHeaderMap).forEach(([rawKey, originalKey]) => {
    if (next[rawKey] || next[originalKey]) {
      next[rawKey] = "[REDACTED]";
      next[originalKey] = "[REDACTED]";
    }
  });

  return next;
};

/**
 * Recursively masks sensitive keys in payloads used for diagnostics.
 */
const redactSensitiveData = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (typeof value !== "object") {
    return value;
  }

  const sensitiveKeys = [
    "token",
    "accessToken",
    "refreshToken",
    "otp",
    "email",
    "password",
    "cookie",
    "cookies",
    "authorization",
  ];
  const sensitiveKeysLower = new Set(sensitiveKeys.map((key) => key.toLowerCase()));

  return Object.entries(value).reduce<Record<string, any>>((acc, [key, nestedValue]) => {
    if (sensitiveKeysLower.has(key.toLowerCase())) {
      acc[key] = "[REDACTED]";
      return acc;
    }
    acc[key] = redactSensitiveData(nestedValue);
    return acc;
  }, {});
};

/**
 * Logs outgoing request metadata with optional payload redaction.
 */
const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log("[API REQUEST]", {
    method: config.method?.toUpperCase(),
    url: joinUrl(config.baseURL, config.url),
    timeout: config.timeout,
    headers: sanitizeHeaders(config.headers as Record<string, any> | undefined),
    data: isDebug ? config.data : redactSensitiveData(config.data),
  });
};

/**
 * Logs successful response metadata for API observability.
 */
const logResponse = (status: number, config: InternalAxiosRequestConfig, data: any) => {
  console.log("[API RESPONSE]", {
    method: config.method?.toUpperCase(),
    url: joinUrl(config.baseURL, config.url),
    status,
    data: isDebug ? data : redactSensitiveData(data),
  });
};

/**
 * Logs transport and response errors with network-context hints.
 */
const logError = (error: AxiosError) => {
  const fullUrl = joinUrl(error.config?.baseURL, error.config?.url);
  const isNetworkError = !!error.request && !error.response;

  if (isNetworkError) {
    console.error("[API ERROR] Device cannot reach server", {
      baseURL: error.config?.baseURL || API_BASE_URL,
      requestUrl: fullUrl,
      deviceType: getDeviceTypeLabel(),
      message: error.message,
      code: error.code,
    });
    return;
  }

  console.error("[API ERROR]", {
    method: error.config?.method?.toUpperCase(),
    url: fullUrl,
    message: error.message,
    code: error.code,
    status: error.response?.status,
    response: isDebug ? error.response?.data : redactSensitiveData(error.response?.data),
  });
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Exposes immutable resolved base URL for shared consumption.
 */
export const getBaseURL = () => API_BASE_URL;

/**
 * Performs backend health probe used by auth bootstrap and diagnostics.
 */
export const checkApiHealth = async () => {
  return apiClient.get('/health');
};

export const configureAuthLifecycle = (handlers: AuthLifecycleHandlers) => {
  authLifecycleHandlers.getAccessToken = handlers.getAccessToken;
  authLifecycleHandlers.refreshAccessToken = handlers.refreshAccessToken;
  authLifecycleHandlers.onAuthFailure = handlers.onAuthFailure;
};


apiClient.interceptors.request.use((config) => {
  const token = authLifecycleHandlers.getAccessToken?.();

  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  logRequest(config);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logResponse(response.status, response.config, response.data);
    return response;
  },
  async (error: AxiosError) => {
    logError(error);

    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestUrl = String(originalRequest?.url || "");
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = requestUrl.includes("/auth/refresh-token");
    const isAuthEndpoint = requestUrl.includes("/auth/send-otp") || requestUrl.includes("/auth/verify-otp") || requestUrl.includes("/auth/resend-otp");

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await authLifecycleHandlers.refreshAccessToken?.();

        if (refreshedToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("[API AUTH] Token refresh failed", refreshError);
      }

      await authLifecycleHandlers.onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);

/**
 * Converts unknown API/transport failures into user-safe message strings.
 */
export const toApiErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return "Unexpected error occurred. Please try again.";
  }

  if (!error.response) {
    return "Cannot connect to server. Ensure same network or correct API URL.";
  }

  const data = error.response.data as any;
  return data?.message || data?.error || error.message || "Request failed.";
};
