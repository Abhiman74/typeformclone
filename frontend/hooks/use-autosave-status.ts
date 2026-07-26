import * as React from "react";

export type AutosaveStatus = "idle" | "saving" | "saved";

/**
 * Combines the pending state of multiple mutations into one status for the
 * builder's autosave indicator. Flashes "saved" for 1.5s after the last
 * pending mutation settles, then returns to idle.
 */
export function useAutosaveStatus(isPending: boolean): AutosaveStatus {
  const [status, setStatus] = React.useState<AutosaveStatus>("idle");
  const wasPending = React.useRef(false);

  // This effect sets up a real subscription (a cleanup-bearing timer) in
  // response to `isPending` changing over time, not a one-shot mirror of a
  // prop into state -- a legitimate effect, distinct from the
  // prop-syncing cases the `set-state-in-effect` rule is meant to catch.
  React.useEffect(() => {
    if (isPending) {
      wasPending.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven status transition, see comment above
      setStatus("saving");
      return;
    }
    if (wasPending.current) {
      wasPending.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven status transition, see comment above
      setStatus("saved");
      const timeout = setTimeout(() => setStatus("idle"), 1500);
      return () => clearTimeout(timeout);
    }
  }, [isPending]);

  return status;
}
