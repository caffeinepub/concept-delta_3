import { useState, useEffect, useRef } from 'react';

export function useTestTimer(durationMinutes: number, onExpire?: () => void) {
  const totalSeconds = durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (durationMinutes <= 0) return;
    setRemainingSeconds(durationMinutes * 60);
    setIsExpired(false);
  }, [durationMinutes]);

  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const percentage = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  return { remainingSeconds, isExpired, formatted, percentage };
}
