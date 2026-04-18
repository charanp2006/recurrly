import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = 5500;

const trimTrailingSlash = (value: unknown) => String(value ?? "").replace(/\/+$/, "");

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

const sanitizeBaseUrl = (value: unknown) => {
  return trimTrailingSlash(ensureProtocol(value));
};

const isLocalhostHost = (value: unknown) => {
  return /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(String(value ?? ""));
};

const isAndroidEmulator = () => {
  return Platform.OS === "android" && !Constants.isDevice;
};

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

export const resolveApiBaseUrl = () => {
  try {
    const configured = process.env.EXPO_PUBLIC_API_URL;
    if (configured) {
      const normalized = sanitizeBaseUrl(configured);
      const resolved =
        isAndroidEmulator() && isLocalhostHost(normalized)
          ? `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1`
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

const sanitizeHeaders = (headers: Record<string, any> | undefined) => {
  if (!headers) {
    return headers;
  }

  const next = { ...headers };
  if (next.Authorization) {
    next.Authorization = "Bearer [REDACTED]";
  }
  return next;
};

const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log("[API REQUEST]", {
    method: config.method?.toUpperCase(),
    url: joinUrl(config.baseURL, config.url),
    timeout: config.timeout,
    headers: sanitizeHeaders(config.headers as Record<string, any> | undefined),
    data: config.data,
  });
};

const logResponse = (status: number, config: InternalAxiosRequestConfig, data: any) => {
  console.log("[API RESPONSE]", {
    method: config.method?.toUpperCase(),
    url: joinUrl(config.baseURL, config.url),
    status,
    data,
  });
};

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
    response: error.response?.data,
  });
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBaseURL = () => API_BASE_URL;

export const checkApiHealth = async () => {
  return apiClient.get('/health');
};


apiClient.interceptors.request.use((config) => {
  logRequest(config);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logResponse(response.status, response.config, response.data);
    return response;
  },
  (error: AxiosError) => {
    logError(error);
    return Promise.reject(error);
  },
);

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
