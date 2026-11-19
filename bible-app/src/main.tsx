import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext";
import { registerUpdateHooks, setUpdateAvailable } from "./lib/appUpdate";
import { cleanupLegacyCaches, requestPersistentStorage } from "./lib/offlineStatus";
import { initViewportHeight } from "./lib/viewportHeight";

cleanupLegacyCaches();
requestPersistentStorage();
initViewportHeight();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);

// Loaded as a dynamic import, fired off only after React has already
// mounted — not a static `import ... from "virtual:pwa-register"` at the
// top of this file like before. A static import of it forces the browser
// to fully fetch *and evaluate* its separate chunk (workbox-window) before
// ANY of this module's own code can run at all, ES modules being required
// to resolve every static import first — so on every single app launch,
// React couldn't paint a single pixel until that extra chunk had
// round-tripped through the cache and been parsed, purely to support a
// background "Update available" check that has no reason to block first
// paint. Detect new builds, but don't force a reload the moment one is
// found — a silent reload could yank a reader off whatever they're
// mid-read on. Instead, surface it as an "Update available" state the
// reader can act on from Settings (see lib/appUpdate.ts), and hand that
// module the live ServiceWorkerRegistration so a manual "Check for
// updates" tap can ask the browser to look for a new build on demand, not
// just wait for its own periodic check.
import("virtual:pwa-register").then(({ registerSW }) => {
  let updateSW: (reload?: boolean) => Promise<void>;
  updateSW = registerSW({
    onNeedRefresh: () => setUpdateAvailable(),
    onRegisteredSW: (_url, registration) => registerUpdateHooks(updateSW, registration),
  });
});
