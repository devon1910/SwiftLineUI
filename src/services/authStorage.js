const AUTH_KEYS = [
  "user",
  "refreshToken",
  "userEmail",
  "userId",
  "userName",
];

const getStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
};

const readValue = (key) => {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  let rawValue;
  try {
    rawValue = storage.getItem(key);
  } catch {
    return null;
  }

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (parsedValue === null || parsedValue === undefined) {
      return null;
    }

    if (typeof parsedValue === "object") {
      return parsedValue.accessToken ?? parsedValue.token ?? null;
    }

    return String(parsedValue);
  } catch {
    return rawValue;
  }
};

export const getStoredAccessToken = () => readValue("user");

export const getStoredRefreshToken = () => readValue("refreshToken");

export const getStoredUserId = () => readValue("userId");

export const storeAuthTokens = (accessToken, refreshToken = null) => {
  const storage = getStorage();

  if (!storage || !accessToken) {
    return;
  }

  storage.setItem("user", JSON.stringify(accessToken));
  if (refreshToken) storage.setItem("refreshToken", JSON.stringify(refreshToken));
};

export const clearAuthStorage = () => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  AUTH_KEYS.forEach((key) => storage.removeItem(key));
};
