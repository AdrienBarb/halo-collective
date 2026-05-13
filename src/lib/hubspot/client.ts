import { isProduction } from "@/utils/environments";

const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const HUBSPOT_TIMEOUT_MS = 15_000;

export class HubSpotError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "HubSpotError";
    this.status = status;
    this.body = body;
  }
}

function getToken(): string {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not set");
  }
  return token;
}

interface HubSpotRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
}

// Logs the outgoing call without leaking PII — keeps property keys (which fields
// are being set) and UTM values (debug-relevant) but never email or names.
function logDryRun(
  method: string,
  path: string,
  body: unknown,
): void {
  const props =
    body &&
    typeof body === "object" &&
    "properties" in body &&
    typeof (body as { properties: unknown }).properties === "object" &&
    (body as { properties: unknown }).properties !== null
      ? ((body as { properties: Record<string, unknown> }).properties)
      : null;
  console.info(
    JSON.stringify({
      scope: "hubspot.dry_run",
      method,
      path,
      properties_keys: props ? Object.keys(props) : [],
      halo_utm_source: props?.halo_utm_source ?? null,
      halo_utm_campaign: props?.halo_utm_campaign ?? null,
    }),
  );
}

export async function hubspotFetch<T = unknown>(
  path: string,
  options: HubSpotRequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  if (!isProduction) {
    logDryRun(method, path, body);
    return undefined as T;
  }

  let res: Response;
  try {
    res = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${getToken()}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(HUBSPOT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new HubSpotError(
        `HubSpot request timed out after ${HUBSPOT_TIMEOUT_MS}ms: ${method} ${path}`,
        0,
        null,
      );
    }
    throw error;
  }

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
    const fallback = `HubSpot request failed: ${method} ${path} (${res.status})`;
    let message = fallback;
    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
    ) {
      message = (payload as { message: string }).message;
    }
    throw new HubSpotError(message, res.status, payload);
  }

  return payload as T;
}
