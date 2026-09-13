import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// Global stylesheet: Tailwind (built locally and purged) plus the design tokens
// every view can lean on.  Imported here so it is bundled and hashed, rather
// than fetched from a third-party CDN on every page load.
import "./assets/styles/app.css";
//import './localStorageInterceptor'; 

createApp(App).use(router).mount("#app");
