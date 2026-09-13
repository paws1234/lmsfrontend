<template>
  <component
    :is="tag"
    v-bind="linkProps"
    class="card stat"
    :class="{ 'stat--link': isLink }"
  >
    <span class="stat__head">
      <span class="stat__label">{{ label }}</span>
      <span class="stat__icon" aria-hidden="true">
        <svg
          class="stat__glyph"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-for="(d, i) in paths" :key="i" :d="d" />
        </svg>
      </span>
    </span>
    <span
      v-if="loading"
      class="skeleton stat__skeleton"
      aria-hidden="true"
    ></span>
    <span v-else class="stat__value">{{ displayValue }}</span>
  </component>
</template>

<script>
import { iconPaths } from "@/icons";

/** Counts read as totals ("1,204"), not as identifiers, so they get separators. */
const NUMBER_FORMAT = new Intl.NumberFormat();

export default {
  name: "StatCard",
  props: {
    /** What the number counts, e.g. "Enrolled students". */
    label: { type: String, required: true },
    /** The figure.  `null`/`undefined` means "could not be loaded" — see below. */
    value: { type: [Number, String], default: null },
    /** A key of the shared icon set (`src/icons.js`). */
    icon: { type: String, default: "chart" },
    /** Route to the page behind the figure; makes the whole tile a link. */
    to: { type: String, default: "" },
    loading: { type: Boolean, default: false },
  },
  computed: {
    tag() {
      return this.isLink ? "router-link" : "div";
    },
    isLink() {
      return Boolean(this.to);
    },
    linkProps() {
      return this.isLink ? { to: this.to } : {};
    },
    paths() {
      return iconPaths(this.icon);
    },
    displayValue() {
      // An unloaded figure must never render as a real `0`: a tile reading "0
      // students" when the request failed tells the user something false.  The
      // dashboards set `null` on a failed request, which shows as an em dash.
      if (
        this.value === null ||
        this.value === undefined ||
        this.value === ""
      ) {
        return "—";
      }
      return typeof this.value === "number"
        ? NUMBER_FORMAT.format(this.value)
        : this.value;
    },
  },
};
</script>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  /* A tile is a smaller surface than a panel, so it gets the smaller shadow. */
  box-shadow: var(--shadow-sm);
  color: inherit;
  text-decoration: none;
}

.stat__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.stat__label {
  font-size: var(--step--1);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-muted);
}

.stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius);
  background: var(--surface-muted);
  color: var(--text-muted);
}

.stat__glyph {
  width: 1.25rem;
  height: 1.25rem;
}

.stat__value {
  font-size: var(--step-3);
  font-weight: 700;
  line-height: 1.1;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.stat__skeleton {
  display: block;
  width: 4rem;
  height: var(--step-3);
}

/* A linked tile lifts on hover.  The underline is what actually signals the
   link — colour alone would be ambiguous with the tile's own decoration. */
.stat--link {
  transition: box-shadow var(--transition), transform var(--transition);
}

.stat--link:hover {
  border-color: var(--ring);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.stat--link:hover .stat__label {
  color: var(--text);
  text-decoration: underline;
}
</style>
