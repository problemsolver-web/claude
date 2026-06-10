"use client";

import { useEffect } from "react";

// Registers the service worker so the app becomes installable (icon on home
// screen, fullscreen launch). Safe no-op if the browser doesn't support it.
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () =>
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);
  return null;
}
