import { useState, useCallback } from "react";
import useApi from "../../hook/useApi";
import { fetchUrlsApi, fetchUrlDetailsApi, createShortUrlApi, deleteUrlApi } from "../lib/linkApi";
import { transformUrl } from "../lib/formatters";

export function useLinks() {
  const apiFetch = useApi();
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 10 });

  const fetchUrls = useCallback(async (page = 1) => {
    try {
      setUrlsLoading(true);
      const res = await fetchUrlsApi(apiFetch, page);
      if (!res.ok) throw new Error("Failed to fetch URLs");
      const data = await res.json();
      if (data.success && data.data) {
        setUrls(data.data.map(transformUrl));
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("fetchUrls:", err);
    } finally {
      setUrlsLoading(false);
    }
  }, [apiFetch]);

  const fetchUrlDetails = useCallback(async (shortCode) => {
    try {
      setDetailsLoading(true);
      const res = await fetchUrlDetailsApi(apiFetch, shortCode);
      if (!res.ok) throw new Error("Failed to fetch URL details");
      const data = await res.json();
      if (data.success && data.data) setSelectedUrl(data.data);
    } catch (err) {
      console.error("fetchUrlDetails:", err);
    } finally {
      setDetailsLoading(false);
    }
  }, [apiFetch]);

  const createUrl = useCallback(async ({ longUrl, customSlug }) => {
    const res = await createShortUrlApi(apiFetch, {
      originalUrl: longUrl,
      customCode: customSlug || undefined,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.message || "Failed to create short URL");
    }
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to create short URL");

    const newEntry = transformUrl({
      _id: Date.now(),
      shortCode: data.data.shortCode,
      originalUrl: data.data.originalUrl,
      totalClicks: data.data.totalClicks || 0,
      createdAt: data.data.createdAt,
      isActive: true,
    });
    setUrls((prev) => [newEntry, ...prev]);
    return data.data.shortUrl;
  }, [apiFetch]);

  const deleteUrl = useCallback(async (shortCode) => {
    const res = await deleteUrlApi(apiFetch, shortCode);
    if (!res.ok) throw new Error("Failed to delete URL");
    setUrls((prev) => prev.filter((u) => u.shortCode !== shortCode));
    if (selectedUrl?.shortCode === shortCode) setSelectedUrl(null);
  }, [apiFetch, selectedUrl]);

  const bulkDelete = useCallback(async (shortCodes) => {
    await Promise.all(shortCodes.map((code) => deleteUrlApi(apiFetch, code)));
    setUrls((prev) => prev.filter((u) => !shortCodes.includes(u.shortCode)));
  }, [apiFetch]);

  return {
    urls, setUrls, urlsLoading, pagination,
    selectedUrl, setSelectedUrl, detailsLoading,
    fetchUrls, fetchUrlDetails, createUrl, deleteUrl, bulkDelete,
  };
}