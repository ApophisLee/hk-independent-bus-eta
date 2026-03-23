import { useCallback, useContext, useEffect } from "react";
import AppContext from "../context/AppContext";

/**
 * Detects screen reader or VoiceOver usage and auto-enables
 * accessibility mode. Listens for:
 * 1. `prefers-reduced-motion` media query (common when VoiceOver is on).
 * 2. Messages from the React Native wrapper indicating VoiceOver state.
 */
const useAccessibilityDetection = (): void => {
  const { accessibilityMode, setAccessibilityMode } = useContext(AppContext);

  const handleNativeMessage = useCallback(
    (event: Event & { data?: string }) => {
      try {
        const data = JSON.parse(event.data ?? "{}");
        if (data.type === "voiceover" && typeof data.value === "boolean") {
          setAccessibilityMode(data.value);
        }
      } catch {
        // Ignore malformed messages.
      }
    },
    [setAccessibilityMode]
  );

  // Auto-enable when prefers-reduced-motion is detected (heuristic).
  useEffect(() => {
    if (accessibilityMode) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      setAccessibilityMode(true);
    }

    const onChange = (e: MediaQueryListEvent): void => {
      if (e.matches) {
        setAccessibilityMode(true);
      }
    };
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [accessibilityMode, setAccessibilityMode]);

  // Listen for voiceover messages from React Native wrapper.
  useEffect(() => {
    window.addEventListener("message", handleNativeMessage);
    return () => {
      window.removeEventListener("message", handleNativeMessage);
    };
  }, [handleNativeMessage]);
};

export default useAccessibilityDetection;
