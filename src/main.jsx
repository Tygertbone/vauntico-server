import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { initPerformanceMonitoring } from "./utils/performance.js";
import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";

// Initialize Sentry for error tracking
if (process.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    integrations: [browserTracingIntegration()],
    // Performance monitoring
    tracesSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

// Initialize performance monitoring
initPerformanceMonitoring();
