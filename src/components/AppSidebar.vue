<template>
  <div class="sidebar-shell">
    <!--
      Mobile top bar.  The menu button used to be `position: fixed`, so it sat
      on top of whatever heading the page rendered at the top-left.  Living in
      normal flow means it can never cover the page.
    -->
    <header class="sidebar-bar">
      <button
        ref="menuBtn"
        type="button"
        class="sidebar-bar__btn"
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        :aria-expanded="drawerOpen ? 'true' : 'false'"
        @click="openDrawer"
      >
        <svg
          class="sidebar-bar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path v-for="(d, i) in icon('menu')" :key="i" :d="d" />
        </svg>
      </button>
      <span class="sidebar-bar__title">{{ title }}</span>
    </header>

    <!--
      One <nav>: an off-canvas drawer below 1024px, a collapsible rail from
      1024px up.  Both are the same element, so there is no second copy of the
      links to keep in sync.
    -->
    <nav
      id="app-sidebar"
      class="sidebar"
      :class="{
        'sidebar--open': drawerOpen,
        'sidebar--rail': collapsed && wide,
      }"
      aria-label="Main navigation"
    >
      <div class="sidebar__head">
        <!-- Initials instead of an avatar: the old one was a
             `via.placeholder.com` request that failed on every page load. -->
        <span class="sidebar__avatar" aria-hidden="true">{{ initials }}</span>
        <span class="sidebar__identity">
          <span class="sidebar__name">{{ title }}</span>
          <span class="sidebar__role">{{ subtitle }}</span>
        </span>

        <button
          type="button"
          class="sidebar__icon-btn sidebar__collapse"
          aria-controls="app-sidebar"
          :aria-expanded="collapsed ? 'false' : 'true'"
          :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
          @click="toggleCollapsed"
        >
          <svg
            class="sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-for="(d, i) in icon('collapse')" :key="i" :d="d" />
          </svg>
        </button>

        <button
          ref="closeBtn"
          type="button"
          class="sidebar__icon-btn sidebar__close"
          aria-label="Close navigation"
          @click="closeDrawer"
        >
          <svg
            class="sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path v-for="(d, i) in icon('close')" :key="i" :d="d" />
          </svg>
        </button>
      </div>

      <ul class="sidebar__list">
        <li v-for="item in items" :key="item.to">
          <router-link
            :to="item.to"
            class="sidebar__link"
            :title="collapsed && wide ? item.label : null"
            @click="closeDrawer"
          >
            <svg
              class="sidebar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="(d, i) in icon(item.icon)" :key="i" :d="d" />
            </svg>
            <span class="sidebar__label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <button type="button" class="sidebar__logout" @click="logout">
        <svg
          class="sidebar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path v-for="(d, i) in icon('logout')" :key="i" :d="d" />
        </svg>
        <span class="sidebar__label">Logout</span>
      </button>
    </nav>

    <div v-if="drawerOpen" class="sidebar__overlay" @click="closeDrawer"></div>
  </div>
</template>

<script>
import { markRaw } from "vue";
import { performLogout } from "@/logout";

/**
 * Icon paths, stroke-based on a 24x24 grid.  Kept here rather than passed in so
 * a caller cannot hand us raw markup to `v-html`.
 */
const ICONS = {
  home: ["M3 10.5 12 3l9 7.5", "M5.25 9.75V20.25h13.5V9.75"],
  users: [
    "M15 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    "M4.5 20.25a7.5 7.5 0 0 1 15 0",
  ],
  user: [
    "M12 11.25a4.125 4.125 0 1 0 0-8.25 4.125 4.125 0 0 0 0 8.25Z",
    "M4.5 20.25a7.5 7.5 0 0 1 15 0",
  ],
  book: [
    "M4.5 5.25A2.25 2.25 0 0 1 6.75 3H19.5v15H6.75A2.25 2.25 0 0 0 4.5 20.25V5.25Z",
    "M4.5 20.25A2.25 2.25 0 0 1 6.75 18H19.5v3H6.75A2.25 2.25 0 0 1 4.5 20.25Z",
  ],
  calendar: [
    "M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5",
    "M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v12.75a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z",
  ],
  clock: ["M12 7.5V12l3 1.5", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"],
  tasks: [
    "M9 12.75 11.25 15 15 9.75",
    "M6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75Z",
  ],
  chart: ["M4 20.25V10.5M10 20.25V3.75M16 20.25v-6M2.25 20.25h19.5"],
  logout: [
    "M15.75 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-8.25a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h8.25a1.5 1.5 0 0 0 1.5-1.5V15",
    "M9 12h12M18 9l3 3-3 3",
  ],
  menu: ["M4 6h16M4 12h16M4 18h16"],
  close: ["M6 6l12 12M18 6 6 18"],
  collapse: ["M11 6l-6 6 6 6", "M18 6l-6 6 6 6"],
};

/** Width at which the drawer gives way to the persistent rail.  Matches the
 *  `lg:` breakpoint the markup and the app shell both use. */
const WIDE_QUERY = "(min-width: 1024px)";
const STORAGE_KEY = "sidebarCollapsed";

export default {
  name: "AppSidebar",
  props: {
    /** Shown in the top bar and the identity block, e.g. "Admin". */
    title: { type: String, required: true },
    /** The line under it, e.g. "Administrator". */
    subtitle: { type: String, default: "" },
    /** `[{ to, label, icon }]`; `icon` is a key of ICONS. */
    items: { type: Array, required: true },
  },
  data() {
    return {
      // Drawer state (below 1024px only).
      drawerOpen: false,
      // Rail state (1024px and up), remembered between visits.
      collapsed: this.readCollapsed(),
      wide: false,
      // markRaw: a MediaQueryList must not be wrapped in a reactive proxy.
      mediaQuery: markRaw(window.matchMedia(WIDE_QUERY)),
    };
  },
  computed: {
    initials() {
      return this.title.slice(0, 1).toUpperCase();
    },
  },
  watch: {
    // Close the drawer whenever navigation happens, however it was triggered.
    $route() {
      this.closeDrawer();
    },
    drawerOpen(open) {
      // Stop the page behind the drawer from scrolling with it.
      document.body.style.overflow = open ? "hidden" : "";
      if (open) this.$nextTick(() => this.$refs.closeBtn?.focus());
    },
  },
  mounted() {
    this.wide = this.mediaQuery.matches;
    this.mediaQuery.addEventListener("change", this.onBreakpointChange);
    document.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    this.mediaQuery.removeEventListener("change", this.onBreakpointChange);
    document.removeEventListener("keydown", this.onKeydown);
    document.body.style.overflow = "";
  },
  methods: {
    icon(name) {
      return ICONS[name] || [];
    },
    readCollapsed() {
      try {
        return localStorage.getItem(STORAGE_KEY) === "true";
      } catch {
        return false;
      }
    },
    onBreakpointChange(event) {
      this.wide = event.matches;
      // A drawer left open while crossing the breakpoint would sit on top of
      // the rail; the rail is the desktop answer to the same problem.
      if (event.matches) this.drawerOpen = false;
    },
    onKeydown(event) {
      if (event.key === "Escape" && this.drawerOpen) this.closeDrawer();
    },
    openDrawer() {
      this.drawerOpen = true;
    },
    closeDrawer() {
      if (!this.drawerOpen) return;
      this.drawerOpen = false;
      // Return focus to the trigger rather than stranding it on a hidden node.
      this.$nextTick(() => this.$refs.menuBtn?.focus());
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
      try {
        localStorage.setItem(STORAGE_KEY, String(this.collapsed));
      } catch {
        // Preference just will not survive the reload; the current page is fine.
      }
    },
    logout() {
      performLogout(this.$router);
    },
  },
};
</script>

<style scoped>
/* ---------------------------------------------------------------------------
   Mobile top bar

   Visibility is decided here, in media queries, rather than with Tailwind's
   `lg:hidden` / `hidden lg:inline-flex`.  A component's scoped styles are
   injected after the bundled stylesheet, so a plain `.sidebar-bar{display:flex}`
   outranks `.lg\:hidden{display:none}` at equal specificity — the utilities
   silently lose, and the bar and close button stayed visible on desktop.
   --------------------------------------------------------------------------- */
.sidebar-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  position: sticky;
  top: 0;
  z-index: 20;
}

.sidebar-bar__btn {
  display: inline-flex;
  padding: var(--space-2);
  border: 1px solid var(--sidebar-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.sidebar-bar__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.sidebar-bar__title {
  font-weight: 600;
}

/* Gold focus ring: the app-wide `--ring` is a dark blue in light mode, which
   would be invisible against this sidebar. */
.sidebar-bar :focus-visible,
.sidebar :focus-visible {
  outline: 2px solid var(--sidebar-active-bg);
  outline-offset: 2px;
}

/* ---------------------------------------------------------------------------
   The drawer / rail itself
   --------------------------------------------------------------------------- */
.sidebar {
  --sidebar-w: 16rem;

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: var(--sidebar-w);
  height: 100vh;
  padding: var(--space-4);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--sidebar-border);
  overflow-y: auto;
  /* Drawer: off-canvas until opened. */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  transform: translateX(-100%);
  transition:
    transform var(--transition),
    width var(--transition);
}

.sidebar--open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  /* Desktop: the top bar's job is done by the rail itself.  The two button
     rules are compound selectors on purpose — they appear *before*
     `.sidebar__icon-btn` in this file, so at equal specificity the later base
     rule would win and leave the mobile close button on screen. */
  .sidebar-bar,
  .sidebar__icon-btn.sidebar__close,
  .sidebar__overlay {
    display: none;
  }

  .sidebar__icon-btn.sidebar__collapse {
    display: inline-flex;
  }

  .sidebar-shell {
    flex: 0 0 auto;
  }

  /* In flow again: the layout's flex row decides the width from here. */
  .sidebar {
    position: static;
    height: 100%;
    transform: none;
  }

  .sidebar--rail {
    --sidebar-w: 4.75rem;
  }

  /* Rail: icon-only.  The `title` attribute set in the template carries the
     label for pointer users. */
  .sidebar--rail .sidebar__identity,
  .sidebar--rail .sidebar__label {
    display: none;
  }

  .sidebar--rail .sidebar__head {
    justify-content: center;
  }

  .sidebar--rail .sidebar__link,
  .sidebar--rail .sidebar__logout {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }

  .sidebar--rail .sidebar__collapse .sidebar__icon {
    transform: rotate(180deg);
  }
}

.sidebar__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 700;
}

.sidebar__identity {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.sidebar__name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__role {
  font-size: var(--step--1);
  color: var(--sidebar-muted);
}

.sidebar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: var(--space-2);
  border: 1px solid var(--sidebar-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

/* Only the desktop collapse control is hidden below the breakpoint; the close
   button is the mobile one and is hidden from 1024px up (see the media query
   above). */
.sidebar__collapse {
  display: none;
}

.sidebar__icon-btn:hover {
  background: var(--sidebar-hover);
}

.sidebar__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__link,
.sidebar__logout {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 0.625rem var(--space-3);
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--sidebar-text);
  font: inherit;
  font-size: var(--step-0);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--transition),
    color var(--transition);
}

.sidebar__link:hover,
.sidebar__logout:hover {
  background: var(--sidebar-hover);
}

/* Vue Router adds these; exact match stops /admin/students and
   /admin/students/create from lighting up together. */
.sidebar__link.router-link-exact-active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
}

.sidebar__icon {
  width: 1.375rem;
  height: 1.375rem;
  flex: 0 0 auto;
}

.sidebar__logout {
  /* Pinned to the bottom: the nav is a flex column, so `auto` here is what
     pushes it down (the old `mt-auto` sat inside a non-flex wrapper and did
     nothing). */
  margin-top: auto;
  color: var(--sidebar-danger);
}

.sidebar__logout:hover {
  background: var(--sidebar-danger-bg);
  color: #ffffff;
}

.sidebar__overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.5);
}
</style>
