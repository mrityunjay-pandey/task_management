const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const API_URL = rawApiUrl.replace(/\/+$/, "");

// Matches the backend's global exception filter and controller response
// shape: every response is either { data: T, error: null } or
// { data: null, error: { statusCode, message } }.
export interface ApiEnvelope<T> {
  data: T | null;
  error: { statusCode: number; message: string } | null;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Every fetch call funnels through here so cookie handling and error
// unwrapping only need to be written once. `credentials: "include"` is
// required for the httpOnly session cookie to be sent cross-origin
// (frontend on :3000, backend on :4000/deployed backend URL).
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 204 No Content responses (e.g. DELETE) have no JSON body to parse
  if (res.status === 204) {
    return undefined as T;
  }

  const body = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || body.error) {
    throw new ApiError(
      body.error?.message ?? "Something went wrong. Please try again.",
      res.status,
    );
  }

  return body.data as T;
}
