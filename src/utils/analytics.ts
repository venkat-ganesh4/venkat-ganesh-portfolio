
const API_URL = "http://localhost:5000/api/analytics/events";

type AnalyticsEventType =
  | "page_view"
  | "click"
  | "resume_download"
  | "contact_click"
  | "project_view"
  | "section_view";

type AnalyticsEvent = {
  eventType: AnalyticsEventType;
  pagePath?: string;
  target?: string;
};

function getStoredId(key: string, storage: Storage): string {
  let id = storage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(key, id);
  }

  return id;
}

function getDeviceType(): "desktop" | "mobile" | "tablet" {
  const width = window.innerWidth;

  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function getTrafficSource(): string {
  const params = new URLSearchParams(window.location.search);
  const campaignSource = params.get("utm_source");

  if (campaignSource) return campaignSource.slice(0, 100);

  if (!document.referrer) return "direct";

  try {
    return new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
}

export function trackEvent({
  eventType,
  pagePath = window.location.pathname,
  target,
}: AnalyticsEvent): void {
  try {
    const payload = {
      visitorId: getStoredId("portfolio_visitor_id", localStorage),
      sessionId: getStoredId("portfolio_session_id", sessionStorage),
      eventType,
      pagePath,
      target,
      source: getTrafficSource(),
      deviceType: getDeviceType(),
    };

    void fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics should never break the portfolio.
  }
}

export function trackPageView(): void {
  trackEvent({ eventType: "page_view" });
}
