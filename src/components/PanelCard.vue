<template>
  <section class="card panel">
    <header v-if="title || action" class="panel__head">
      <h2 v-if="title" class="panel__title">{{ title }}</h2>
      <!-- The action is a real link, not a styled span: it navigates. -->
      <router-link v-if="action" :to="action.to" class="panel__action">
        {{ action.label }}
      </router-link>
    </header>

    <div v-if="loading" class="panel__loading" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="skeleton panel__skeleton"></span>
    </div>

    <!-- "Nothing here" and "we could not load this" are different facts, so the
         caller owns the wording and only passes `empty` when the list is
         genuinely empty rather than when the request failed. -->
    <div v-else-if="empty" class="empty-state">
      <p class="empty-state-title">{{ emptyTitle }}</p>
      <p v-if="emptyText">{{ emptyText }}</p>
    </div>

    <div v-else class="panel__body">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  name: "PanelCard",
  props: {
    /** Heading for the panel.  Omit it for a card that only frames a state. */
    title: { type: String, default: "" },
    /** `{ to, label }` for the link in the panel header, if it has one. */
    action: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    empty: { type: Boolean, default: false },
    emptyTitle: { type: String, default: "Nothing here yet" },
    emptyText: { type: String, default: "" },
  },
};
</script>

<style scoped>
.panel {
  padding: var(--space-4);
  /* The smaller shadow of the two token shadows: a panel is a surface inside
     the page, not a floating sheet. */
  box-shadow: var(--shadow-sm);
}

@media (min-width: 640px) {
  .panel {
    padding: var(--space-6);
  }
}

.panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  margin-bottom: var(--space-4);
}

.panel__title {
  font-size: var(--step-1);
  font-weight: 700;
  line-height: 1.3;
  color: var(--text);
}

.panel__action {
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--link);
}

.panel__action:hover {
  text-decoration: underline;
}

.panel__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.panel__skeleton {
  display: block;
  height: 3rem;
}

.panel__skeleton:last-child {
  width: 70%;
}
</style>
