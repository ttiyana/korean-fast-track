import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Offline shell: network-first for navigations, cache-first for hashed assets.
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is optional */
    })
  })
}
