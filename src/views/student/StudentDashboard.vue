<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Student portal</p>
      <h1 class="page__title">Student Dashboard</h1>
      <p class="page__lead">
        Your subjects, the work assigned to you and what is coming up.
      </p>
    </header>

    <p v-if="loading" class="sr-only" role="status">Loading dashboard…</p>

    <!-- Exactly one state is on screen, the same rule the scores view follows:
         a "no profile" panel beside empty tiles would imply figures had been
         counted when the lookup never got that far. -->
    <PanelCard v-if="profileMissing" :empty="true" empty-title="Your profile is not set up yet"
      empty-text="Your account exists, but it is not linked to a student record, so there are no subjects, tasks or schedules to show. Ask your administrator to enrol you, then reload this page." />

    <p v-else-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="loadStatsData">
        Try again
      </button>
    </p>

    <template v-else>
      <section class="page__tiles" aria-label="Totals">
        <StatCard label="Enrolled subjects" icon="book" :value="subjectCount" :loading="loading"
          to="/student/studentlists" />
        <StatCard label="Tasks given" icon="tasks" :value="tasksGivenCount" :loading="loading" to="/student/tasks" />
        <StatCard label="Scheduled subjects" icon="clock" :value="schedules.length" :loading="loading" />
      </section>

      <div class="page__split">
        <PanelCard title="Upcoming events" :loading="loading" :empty="!events.length" empty-title="No events scheduled"
          empty-text="School events appear here as soon as an administrator adds them.">
          <EventList :events="events" />
        </PanelCard>
        <PanelCard title="Your schedule" :loading="loading" :empty="!schedules.length" empty-title="No schedules yet"
          empty-text="A subject appears here once it has a schedule and you are enrolled in it.">
          <ul class="schedule">
            <li v-for="schedule in schedules" :key="schedule.id" class="schedule__item">
              <h3 class="schedule__title">{{ schedule.title }}</h3>
              <dl class="schedule__facts">
                <dt>Teacher</dt>
                <dd>{{ schedule.name }}</dd>
                <dt>Schedule</dt>
                <dd>{{ schedule.schedule }}</dd>
              </dl>
              <p v-if="schedule.description" class="schedule__description">
                {{ schedule.description }}
              </p>
            </li>
          </ul>
        </PanelCard>
      </div>
    </template>
  </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import StatCard from "@/components/StatCard.vue";
import PanelCard from "@/components/PanelCard.vue";
import EventList from "@/components/EventList.vue";

export default {
  name: "StudentDashboard",
  components: { StatCard, PanelCard, EventList },
  data() {
    return {
      loading: true,
      // Set when /student/stats answers 404: the account exists but has no
      // `students` row, so there is no profile to show figures for.
      profileMissing: false,
      loadError: "",
      subjectCount: 0,
      tasksGivenCount: 0,
      schedules: [],
      events: [],
    };
  },
  mounted() {
    this.checkAccess();
    this.loadStatsData();
  },
  methods: {
    async checkAccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
    },
    /* The old `loadDashboardData()` lived here.  It fetched nothing — it only
       set `loading = false` — so the loading state ended before the request it
       appeared to be waiting on had even started.  `loadStatsData()` now owns
       that flag via `finally`.  The `stats` object it used to fill is gone too:
       nothing ever rendered it. */
    async loadStatsData() {
      this.loading = true;
      this.profileMissing = false;
      this.loadError = "";
      try {
        const response = await axios.get("/student/stats");
        this.subjectCount = response.data.subjectCount;
        this.tasksGivenCount = response.data.taskGivenCount;
        this.events = response.data.events || [];
        this.schedules = response.data.scheduleCount || [];
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Registering creates a `users` row but no `students` row, and this
          // endpoint 404s when there is none.  Zeros would look like real
          // figures, so say what is actually happening instead.
          this.profileMissing = true;
        } else {
          this.loadError = apiErrorMessage(
            error,
            "We couldn't load your dashboard. Please try again later.",
          );
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
}

/* Dividers belong between rows, so the first row has none. */
.schedule__item {
  padding: var(--space-3) 0;
  border-top: 1px solid var(--border);
}

.schedule__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.schedule__title {
  font-size: var(--step-0);
  font-weight: 600;
  color: var(--text);
}

/* Term beside value, so a column of values lines up under itself. */
.schedule__facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-3);
  margin-top: var(--space-2);
  font-size: var(--step--1);
}

.schedule__facts dt {
  font-weight: 600;
  color: var(--text-muted);
}

.schedule__facts dd {
  margin: 0;
  color: var(--text);
}

.schedule__description {
  margin-top: var(--space-2);
  color: var(--text-muted);
}
</style>
