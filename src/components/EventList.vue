<template>
  <ul class="events">
    <li v-for="event in events" :key="event.id" class="events__item">
      <div class="events__text">
        <h3 class="events__name">{{ event.name }}</h3>
        <p v-if="event.description" class="events__description">
          {{ event.description }}
        </p>
      </div>
      <time v-if="event.date" class="events__date" :datetime="event.date">
        {{ formatDate(event.date) }}
      </time>
    </li>
  </ul>
</template>

<script>
/** `2026-10-01` — no time part, which is what the API stores for an event. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default {
  name: "EventList",
  props: {
    /** `[{ id, name, description, date }]`, as returned by the events endpoint. */
    events: { type: Array, required: true },
  },
  methods: {
    formatDate(value) {
      // A bare `new Date("2026-10-01")` is parsed as UTC midnight, so anywhere
      // west of Greenwich it renders as the 30th.  Date-only values are built
      // from their parts instead, which keeps them in the reader's own day.
      const date = DATE_ONLY.test(value)
        ? this.fromParts(value)
        : new Date(value);
      // Anything unparseable is shown exactly as the API sent it: a raw
      // "2026-10-01" is far better than "Invalid Date".
      return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
    },
    fromParts(value) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    },
  },
};
</script>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
}

/* Dividers belong between rows, so the first row has none. */
.events__item {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--border);
}

.events__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.events__name {
  font-size: var(--step-0);
  font-weight: 600;
  color: var(--text);
}

.events__description {
  margin-top: var(--space-1);
  color: var(--text-muted);
}

.events__date {
  justify-self: start;
  align-self: start;
  padding: 2px var(--space-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-muted);
  font-size: var(--step--1);
  font-weight: 600;
  white-space: nowrap;
}

/* From tablet up the date sits on its own right-hand column, so a long
   description wraps instead of pushing the date onto a second line. */
@media (min-width: 640px) {
  .events__item {
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: var(--space-4);
  }
}
</style>
