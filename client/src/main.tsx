import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Suppress Vite HMR WebSocket errors in development
if (import.meta.env.DEV) {
  window.addEventListener("error", (event) => {
    if (event.message?.includes("WebSocket") && event.message?.includes("closed")) {
      event.preventDefault();
    }
  });
  
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.includes("WebSocket") && event.reason?.message?.includes("closed")) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
