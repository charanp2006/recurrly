type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof globalThis.atob !== "function") {
    return null;
  }

  try {
    return globalThis.atob(padded);
  } catch {
    return null;
  }
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const [_, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  const decodedPayload = decodeBase64Url(payload);
  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const isJwtExpired = (token: string, skewSeconds = 30) => {
  const payload = decodeJwtPayload(token);
  const expiresAt = payload?.exp;

  if (typeof expiresAt !== "number") {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return expiresAt <= nowInSeconds + skewSeconds;
};
