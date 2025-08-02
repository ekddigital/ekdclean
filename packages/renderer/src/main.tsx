// EKD Clean Renderer - Main Entry Point
// Built by EKD Digital

import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App";
import { theme } from "./theme";

// Import Mantine styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// Import custom styles
import "./styles/global.css";

// Hide loading screen
setTimeout(() => {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.opacity = "0";
    setTimeout(() => loading.remove(), 500);
  }
}, 1000);

// Get root element
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={2077} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
