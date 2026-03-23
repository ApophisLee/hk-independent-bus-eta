import { useCallback, useContext, useEffect } from "react";
import AppContext from "../context/AppContext";

/**
 * Detects screen reader or VoiceOver usage and auto-enables
 * accessibility mode. Listens for explicit VoiceOver/TalkBack signals
 * from the React Native wrapper on both iOS (window) and Android
 * (document) message targets.
 */
const useAccessibilityDetection = (): void => {
  const { setAccessibilityMode } = useContext(AppContext);

  const handleNativeMessage = useCallback(
    (event: MessageEvent) => {
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

  // Listen for voiceover messages from React Native wrapper.
  // iOS posts to window; Android posts to document.
  useEffect(() => {
    const messageTarget: Window | Document =
      (window as any).iOSRNWebView ? window : document;

    messageTarget.addEventListener(
      "message",
      handleNativeMessage as EventListener
    );
    return () => {
      messageTarget.removeEventListener(
        "message",
        handleNativeMessage as EventListener
      );
    };
  }, [handleNativeMessage]);
};

export default useAccessibilityDetection;
