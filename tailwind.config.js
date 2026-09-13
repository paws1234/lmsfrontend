/**
 * Tailwind is built locally and purged, instead of being pulled from a CDN.
 *
 * Why: the previous setup linked the entire framework stylesheet from
 * jsdelivr — measured at 2,934,019 bytes uncompressed (2.7s, render-blocking)
 * on every page load. Scanning the templates below and emitting only the
 * classes that are actually used cuts that by orders of magnitude.
 */
module.exports = {
  // Files Tailwind scans. Anything not listed here (or not written literally
  // in the markup) is considered unused and left out of the stylesheet, so
  // never compose class names at runtime.
  purge: {
    content: ["./public/**/*.html", "./src/**/*.{vue,js}"],
  },
  // The CDN build used the default config, where dark mode is off — which is
  // why the `dark:*` classes in HomeComponent never applied. Choosing `class`
  // makes them work against the `dark` class the component already toggles.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ctu: {
          red: "var(--ctu-red)",
          gold: "var(--ctu-gold)",
          blue: "var(--ctu-blue)",
          cream: "var(--ctu-cream)",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
