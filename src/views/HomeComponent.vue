<template>
  <div class="min-h-screen flex flex-col">
    <!-- Keyboard users can jump past the header in one keystroke.  The target
         carries tabindex="-1" so focus follows the link instead of staying
         behind in the header. -->
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        <!-- University identity.  Deliberately not a heading: the page's only
             h1 is the hero title, and a level-3 "brand" heading above it made
             the document outline start in the wrong place. -->
        <div class="flex items-center gap-3 min-w-0">
          <img class="h-11 w-11 sm:h-12 sm:w-12 object-contain flex-shrink-0" src="/ts2.png"
            alt="Cebu Technological University seal" />
          <div class="min-w-0">
            <p class="font-semibold text-sm sm:text-base text-gray-900 truncate">
              Cebu Technological University
            </p>
            <p class="text-xs sm:text-sm text-gray-600 truncate">
              Danao Campus &middot; Learning Management System
            </p>
          </div>
        </div>

        <!-- Theme toggle.  A real button, so it is reachable with Tab and
             activated with Enter/Space, and it announces its current state.
             It sits on a bordered surface so the icon has a visible edge and
             enough contrast in both themes (the old bare gold icon measured
             under 2:1 on the light page). -->
        <button type="button"
          class="flex-shrink-0 p-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100"
          :aria-pressed="darkMode" :aria-label="darkMode ? 'Switch to the light theme' : 'Switch to the dark theme'
            " @click="toggleDarkMode">
          <!-- Sun icon while the light theme is active -->
          <svg v-if="!darkMode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>

          <!-- Moon icon while the dark theme is active -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"
            aria-hidden="true" focusable="false">
            <path fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </header>
    <!-- Header ends -->

    <!-- Main Section -->
    <main id="main-content" tabindex="-1" class="flex-grow">
      <!-- Hero -->
      <section class="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div class="max-w-7xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
          <!-- Pitch -->
          <div>
            <p
              class="inline-flex items-center rounded-full bg-blue-50 text-blue-900 text-xs sm:text-sm font-semibold px-3 py-1">
              Danao Campus &middot; Learning Management System
            </p>

            <h1 class="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900"
            >
              Teach, learn and track progress in
              <span class="accent">one place</span>.
            </h1>

            <p class="mt-5 text-base sm:text-lg text-gray-600">
              The learning management system for Cebu Technological University,
              Danao Campus &mdash; subjects, schedules, coursework and grades,
              organised by role.
            </p>

            <!-- Buttons.  `flex-wrap` so the two labels stack instead of
                 overflowing on narrow phones, and the pair differs by shape as
                 well as colour so the primary action survives a colour-blind
                 or greyscale reading.  Both come from app.css rather than from
                 `border-*`/`bg-*` utilities, which lose to `.btn`'s own
                 declarations (see the .btn-ghost comment there). -->
            <div class="mt-8 flex flex-wrap gap-3">
              <router-link class="btn btn-primary" to="/login">
                Sign in
              </router-link>
              <router-link class="btn btn-ghost" to="/register">
                Create an account
              </router-link>
            </div>

            <p class="mt-4 text-sm text-gray-600">
              Registration creates a student account. Teacher and administrator
              accounts are set up by the campus office.
            </p>
          </div>

          <!-- Campus photo, framed rather than skewed-blended: `skew-x-[-12deg]`
               and `lg:h-[50vh]` are arbitrary values, which Tailwind 2.2 only
               emits in JIT mode, so both had been silently doing nothing. -->
          <div class="card p-2 sm:p-3">
            <img
class="block w-full h-56 sm:h-72 lg:h-80 object-cover rounded-xl"
              src="/test.jpg"
              alt="The Cebu Technological University Danao Campus building" />
          </div>
        </div>
      </section>

      <!-- Who it is for.  Every bullet maps to a view that exists in the
           router, so the page never advertises work the app cannot do. -->
      <section class="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20" aria-labelledby="roles-heading">
        <div class="max-w-7xl mx-auto">
          <h2 id="roles-heading" class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Built for every role on campus
          </h2>
          <p class="mt-3 max-w-3xl text-gray-600">
            Campus data is split by role, so everyone opens the platform to the
            tools they need.
          </p>

          <!-- Three across only from 1024px up: at 768px a third of the width
               is 219px, which wraps every bullet onto two lines. -->
          <ul class="mt-8 grid gap-6 lg:grid-cols-3">
            <li v-for="role in roles" :key="role.key" class="card p-6">
              <div class="flex items-center gap-3">
                <span
                  class="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-900 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5" aria-hidden="true" focusable="false">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="role.icon" />
                  </svg>
                </span>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ role.title }}
                </h3>
              </div>

              <p class="mt-4 text-sm text-gray-600">{{ role.summary }}</p>

              <ul class="mt-4 space-y-2">
                <li v-for="item in role.items" :key="item" class="flex gap-2 text-sm text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5 flex-shrink-0 text-green-600" aria-hidden="true"
                    focusable="false">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <!-- Footer Section.  A brand band that keeps its colour in both themes on
         purpose: white on blue-900 measures 10.4:1 either way. -->
    <footer class="bg-blue-900 text-white">
      <div
        class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div class="flex items-center gap-3">
          <img class="h-10 w-10 object-contain flex-shrink-0" src="/ts2.png" alt="" aria-hidden="true" />
          <p class="text-sm font-semibold">
            Cebu Technological University &middot; Danao Campus
          </p>
        </div>
        <p class="text-sm">
          &copy; {{ currentYear }} Learning Management System. All rights
          reserved.
        </p>
      </div>
    </footer>
    <!-- Footer ends -->
  </div>
</template>

<script>
import { applyTheme, initTheme, saveTheme } from "../theme";

export default {
  name: "HomeComponent",
  data() {
    return {
      // Local mirror of <html>.dark, kept only so the icons and aria-pressed
      // can re-render.  src/theme.js owns the actual preference.
      darkMode: false,
      currentYear: new Date().getFullYear(),
      // The three audiences the app serves.  Each bullet maps to a view that
      // really exists in src/router/index.js: the student area (enrolled
      // subjects, tasks, scores), the teacher area (subjects, enrolment,
      // question forms, to-dos) and the admin area (student/teacher records,
      // courses, schedules, school events).
      roles: [
        {
          key: "student",
          title: "Students",
          summary: "Your courses, coursework and results.",
          icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342",
          items: [
            "The subjects you are enrolled in",
            "Your weekly class schedule",
            "Tasks to answer and submit",
            "Scores as soon as they are published",
          ],
        },
        {
          key: "teacher",
          title: "Teachers",
          summary: "Run your subjects and assessments.",
          icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
          items: [
            "Create and manage your subjects",
            "Enrol students into a subject",
            "Build question forms and question lists",
            "Plan class work on a to-do list",
          ],
        },
        {
          key: "admin",
          title: "Administrators",
          summary: "Keep the whole campus in view.",
          icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
          items: [
            "Student and teacher records",
            "The course catalogue",
            "Class schedules",
            "School events",
          ],
        },
      ],
    };
  },
  mounted() {
    // Re-assert the theme on mount: the class is already on <html> from the
    // bootstrap, so this only pulls the value into local state.
    this.darkMode = initTheme();
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      applyTheme(this.darkMode);
      saveTheme(this.darkMode);
    },
  },
};
</script>

<style scoped>
/* The theme used to be painted here, on a wrapper div.  It now lives on
   <html> as a single switch (see src/theme.js + the token block in app.css),
   so that dark mode survives navigation to every other route. */
*,
*::before,
*::after {
  box-sizing: inherit;
}
/* The emphasised words in the hero.  The two colours live in app.css as
   `--accent` (red on the light surface, gold on the dark one) because the
   compatibility layer maps one Tailwind class to one token and so cannot
   express "one colour per theme" for a single class.  Note this must NOT be
   written as `:global(.dark) .accent` — the scoped-style compiler treats
   `:global()` as the entire selector and silently drops the rest. */
.accent {
  color: var(--accent);
}

/* Jumping to <main> would otherwise tuck its first line under the sticky
   header. */
#main-content {
  scroll-margin-top: 5rem;
}

/* Long headings read better as evenly filled lines than as a full line plus a
   short orphan; browsers that do not support this simply ignore it. */
h1,
h2 {
  text-wrap: balance;
}

/* <main> is focused programmatically by the skip link, so it must not paint a
   ring around the whole page. */
#main-content:focus {
  outline: none;
}
</style>
