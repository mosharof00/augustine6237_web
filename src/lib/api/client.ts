import createClient, { type Middleware } from "openapi-fetch";
import { clearAccessToken, readAccessToken } from "@/lib/auth/storage";
import { ApiError, unwrapEnvelope, type Envelope } from "./envelope";
import type { paths } from "./schema";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6001/api";

export const api = createClient<paths>({ baseUrl: apiBaseUrl });

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

const bearer: Middleware = {
  onRequest({ request }) {
    const token = readAccessToken();
    if (!token) return request;
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return new Request(request, { headers });
  },
};

api.use(bearer);

type CallResult<T> = {
  data?: Envelope<T>;
  error?: Envelope<T>;
  response: Response;
};

export async function callApi<T>(
  run: () => Promise<CallResult<T>>,
): Promise<T> {
  const result = await run();
  const body = result.data ?? result.error;
  try {
    return unwrapEnvelope<T>(body, result.response.status);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAccessToken();
      onUnauthorized?.();
    }
    throw error;
  }
}
