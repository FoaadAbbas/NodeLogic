import { useState, useRef, useCallback } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const ivRef    = useRef(null);
  const startRef = useRef(null);

  const start = useCallback(() => {
    if (!isRunning) {
      startRef.current = Date.now() - elapsed;
      ivRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
      setIsRunning(true);
    }
  }, [isRunning, elapsed]);

  const pause = useCallback(() => {
    if (isRunning && ivRef.current) { clearInterval(ivRef.current); setIsRunning(false); }
  }, [isRunning]);

  const reset = useCallback(() => {
    if (ivRef.current) clearInterval(ivRef.current);
    setElapsed(0);
    setIsRunning(false);
  }, []);

  const fmt = useCallback((ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }, []);

  return { elapsedTime: elapsed, isRunning, start, pause, reset, formattedTime: fmt(elapsed) };
}
