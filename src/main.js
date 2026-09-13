import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// Global stylesheet: Tailwind (built locally and purged) plus the design tokens
// every view can lean on.  Imported here so it is bundled and hashed, rather
// than fetched from a third-party CDN on every page load.
import "./assets/styles/app.css";
// Resolves the saved (or system) theme and puts it on <html>.  Done here rather
// than inside a view so that it applies on every route, not just the one that
// happens to own the toggle.
import { initTheme } from "./theme";
//import './localStorageInterceptor'; 

initTheme();

createApp(App).use(router).mount("#app");
