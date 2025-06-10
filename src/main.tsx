import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "./assets/index.css";
import App from "./components/App.tsx";

console.log("🔥 MAIN.TSX LOADED - This should definitely show up!");

console.log("🚀 CREATING ROOT - About to render React app");

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <ToastContainer />
  </>
);

console.log("✅ REACT APP RENDERED - App should be visible now");
