import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const TOKEN_KEY = "morsh_crm_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing / storage disabled — the in-memory session still works */
  }
}

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

/** Attach the bearer token to every outgoing request. */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Normalise every failure into an Error carrying { status, code, details } so
 * components never have to dig through axios' response shape.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data?.error;

    // An expired or revoked session drops the token and bounces to /login.
    if (status === 401 && typeof window !== "undefined") {
      setToken(null);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login?expired=1");
      }
    }

    const normalized = new Error(
      payload?.message ||
        (error.code === "ECONNABORTED"
          ? "The request timed out. Please try again."
          : error.request && !error.response
            ? "Cannot reach the server. Is the API running?"
            : "Something went wrong")
    );
    normalized.status = status;
    normalized.code = payload?.code;
    normalized.details = payload?.details;
    return Promise.reject(normalized);
  }
);

/** Unwrap the { success, data, meta } envelope. */
export async function request(config) {
  const { data } = await api.request(config);
  return { data: data.data, meta: data.meta };
}
