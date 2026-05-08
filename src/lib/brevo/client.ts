const BREVO_BASE_URL = "https://api.brevo.com/v3";
const BREVO_TIMEOUT_MS = 15_000;

export class BrevoError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "BrevoError";
    this.status = status;
    this.body = body;
  }
}

function getApiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    throw new Error("BREVO_API_KEY is not set");
  }
  return key;
}

interface BrevoRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export async function brevoFetch<T = unknown>(
  path: string,
  options: BrevoRequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response;
  try {
    res = await fetch(`${BREVO_BASE_URL}${path}`, {
      method,
      headers: {
        "api-key": getApiKey(),
        "content-type": "application/json",
        accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new BrevoError(
        `Brevo request timed out after ${BREVO_TIMEOUT_MS}ms: ${method} ${path}`,
        0,
        null,
      );
    }
    throw error;
  }

  // 204 No Content (e.g. sendNow)
  if (res.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const fallback = `Brevo request failed: ${method} ${path} (${res.status})`;
    let message = fallback;
    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
    ) {
      message = (payload as { message: string }).message;
    }
    throw new BrevoError(message, res.status, payload);
  }

  return payload as T;
}
