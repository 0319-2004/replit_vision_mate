import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Router } from "wouter";

const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") || "";

createRoot(document.getElementById("root")!).render(
  <Router base={base}>
    <App />
  </Router>
);
