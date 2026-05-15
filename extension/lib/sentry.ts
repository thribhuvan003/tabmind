import * as Sentry from "@sentry/browser";

/**
 * Set your Sentry DSN here to enable remote error monitoring.
 * Leave empty to keep all errors local (console only).
 */
const SENTRY_DSN = "";

let ready = false;

export function initSentry(context: "content" | "background") {
  if (!SENTRY_DSN || ready) return;
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: "tabmind@0.1.0",
      environment: "production",
      tracesSampleRate: 0,
      defaultIntegrations: false,
      integrations: [],
      beforeSend(event) {
        if (event.request) delete event.request.url;
        return event;
      },
    });
    ready = true;
    console.info(`[TabMind] Sentry active (${context})`);
  } catch {
    /* Sentry init failed — fail silently */
  }
}

export function captureError(err: unknown, extras?: Record<string, unknown>) {
  console.error("[TabMind]", err, extras ?? "");
  if (!ready) return;
  try {
    Sentry.captureException(err, extras ? { extra: extras } : undefined);
  } catch {
    /* */
  }
}
