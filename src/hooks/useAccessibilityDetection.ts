import { useCallback, useContext, useEffect } from "react";
import AppContext from "../context/AppContext";

/**
 * Hook to auto-detect accessibility needs.
 *
 * Listens for "voiceover" messages posted by the React Native wrapper
 * (sent when the native screen reader / VoiceOver is active) and
 * enables `accessibilityMode` in AppContext when detected.
 */
const useAccessibilityDetection = () => {
  const { setAccessibilityMode } = useContext(AppContext);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "voiceover" && data?.value === true) {
          setAccessibilityMode(true);
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [setAccessibilityMode]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);
};

export default useAccessibilityDetection;
