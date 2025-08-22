import { useCallback, useRef } from "react";

export const useDebounceCallback = (callback, delay) => {
  const debounceRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      // Clear timeout nếu đã có
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set timeout mới
      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup function
  const cancel = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  return [debouncedCallback, cancel];
};
