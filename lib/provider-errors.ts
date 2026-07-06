export type ProviderErrorKind =
  | "quota_exceeded"
  | "rate_limited"
  | "authentication_failed"
  | "provider_unavailable"
  | "unknown";

export type ProviderErrorInfo = {
  kind: ProviderErrorKind;
  status: number;
  message: string;
};

type ErrorLike = {
  status?: unknown;
  code?: unknown;
  type?: unknown;
  message?: unknown;
};

export function classifyProviderError(error: unknown): ProviderErrorInfo {
  const errorLike = isErrorLike(error) ? error : {};
  const status = typeof errorLike.status === "number" ? errorLike.status : 500;
  const code = typeof errorLike.code === "string" ? errorLike.code : "";
  const type = typeof errorLike.type === "string" ? errorLike.type : "";
  const message = typeof errorLike.message === "string" ? errorLike.message : "";
  const normalized = `${code} ${type} ${message}`.toLowerCase();

  if (
    code === "insufficient_quota" ||
    normalized.includes("exceeded your current quota") ||
    normalized.includes("insufficient_quota")
  ) {
    return {
      kind: "quota_exceeded",
      status: 503,
      message:
        "Analysis is temporarily unavailable because the configured AI provider account has no available quota. Add billing or configure a different API key, then retry."
    };
  }

  if (status === 429) {
    return {
      kind: "rate_limited",
      status: 429,
      message:
        "Analysis is temporarily busy because the AI provider rate limit was reached. Please retry in a minute."
    };
  }

  if (status === 401 || status === 403) {
    return {
      kind: "authentication_failed",
      status: 503,
      message:
        "Analysis is unavailable because the server AI credentials are missing, invalid, or not allowed to use the configured model."
    };
  }

  if (status >= 500) {
    return {
      kind: "provider_unavailable",
      status: 503,
      message:
        "Analysis is temporarily unavailable because the AI provider did not complete the request. Please retry shortly."
    };
  }

  return {
    kind: "unknown",
    status: 500,
    message: "Unable to analyze documents. Please check the files and retry."
  };
}

export function isFallbackEligible(kind: ProviderErrorKind) {
  return kind === "quota_exceeded" || kind === "rate_limited" || kind === "provider_unavailable";
}

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === "object" && error !== null;
}
