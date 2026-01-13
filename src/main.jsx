import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { initPerformanceMonitoring } from "./utils/performance.js";
import * as Sentry from "@sentry/react";

// Initialize Sentry for error tracking
Sentry.init({
  dsn: "https://5d94454fcc0960e8d36f67aefd0d05c5@o4510480205807616.ingest.us.sentry.io/4510480214851584",
  environment: process.env.NODE_ENV || "production",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance monitoring
  tracesSampleRate: 1.0,
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

// Initialize performance monitoring
initPerformanceMonitoring();
