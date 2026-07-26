import * as React from "react";

/**
 * Returns a value that only updates `delay`ms after the input stops
 * changing. Used to turn keystroke-by-keystroke edits in the builder into
 * a single PUT request once the user pauses, instead of one request per
 * character.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = React.useRef(callback);

  // Refs must not be written during render (React docs: "Cannot access
  // refs during render") -- an effect that runs after every render keeps
  // `callbackRef` pointing at the latest closure without that violation.
  React.useEffect(() => {
    callbackRef.current = callback;
  });

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return React.useCallback(
    (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );
}
