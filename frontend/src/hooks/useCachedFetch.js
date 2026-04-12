import { useState, useEffect } from 'react';

export function useCachedFetch(url, ttl = 3600000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `cache_${url}`;
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(`${cacheKey}_time`);

    if (cached && cachedTime && Date.now() - cachedTime < ttl) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        setData(result);
        localStorage.setItem(cacheKey, JSON.stringify(result));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        setLoading(false);
      });

    return () => controller.abort();
  }, [url, ttl]);

  return { data, loading };
}
