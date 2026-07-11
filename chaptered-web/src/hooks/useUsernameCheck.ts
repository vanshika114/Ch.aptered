import { useState, useEffect, useRef, useCallback } from 'react';

interface UsernameStatus {
  checking: boolean;
  available: boolean | null;
  suggestions: string[];
}

export function useUsernameCheck(delay = 500) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<UsernameStatus>({ checking: false, available: null, suggestions: [] });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const check = useCallback(async (val: string) => {
    if (val.trim().length < 3) {
      setStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus((prev) => ({ ...prev, checking: true }));

    try {
      const response = await fetch(`/api/auth/check-username/${encodeURIComponent(val.trim())}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      if (!controller.signal.aborted) {
        setStatus({ checking: false, available: data.available, suggestions: data.suggestions || [] });
      }
    } catch {
      if (!controller.signal.aborted) {
        setStatus({ checking: false, available: null, suggestions: [] });
      }
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (username.trim().length < 3) {
      setStatus({ checking: false, available: null, suggestions: [] });
      return;
    }
    setStatus((prev) => ({ ...prev, checking: true }));
    timerRef.current = setTimeout(() => check(username), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [username, delay, check]);

  return { username, setUsername, status };
}
