const BASE = process.env.NEXT_PUBLIC_SERVER_API_URL;

export const fetchUrlsApi = (apiFetch, page = 1) =>
  apiFetch(`${BASE}/api/urls?page=${page}&limit=10`);

export const fetchStatsApi = (apiFetch) =>
  apiFetch(`${BASE}/api/stats`);

export const fetchUrlDetailsApi = (apiFetch, shortCode) =>
  apiFetch(`${BASE}/api/urls/${shortCode}`);

export const createShortUrlApi = (apiFetch, { originalUrl, customCode }) => {
  const isCustom = !!customCode;
  return apiFetch(
    `${BASE}/api/shorten${isCustom ? "/advanced" : ""}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isCustom ? { originalUrl, customCode } : { originalUrl }),
    }
  );
};

export const deleteUrlApi = (apiFetch, shortCode) =>
  apiFetch(`${BASE}/api/urls/${shortCode}`, { method: "DELETE" });

export const fetchLatencyStatsApi = (apiFetch, shortCode) =>
  apiFetch(`${BASE}/api/stats/latency${shortCode ? `?shortCode=${shortCode}` : ""}`);

export const fetchClickTimelineApi = (apiFetch, shortCode, days = 30) =>
  apiFetch(`${BASE}/api/stats/timeline?days=${days}${shortCode ? `&shortCode=${shortCode}` : ""}`);