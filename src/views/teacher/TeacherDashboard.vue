<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching overview</p>
      <h1 class="page__title">Teacher Dashboard</h1>
      <p class="page__lead">
        Your load at a glance, and what is coming up on the calendar.
      </p>
    </header>

    <p v-if="loading" class="sr-only" role="status">Loading dashboard…</p>

    <p v-if="statsError" class="alert alert-error" role="alert">
      {{ statsError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchStatsData">
        Try again
      </button>
    </p>

    <!-- A 404 here means the account has no teacher record at all, which is not
         the same fact as a teacher who happens to have no work assigned. -->
    <PanelCard v-else-if="profileMissing" :empty="true" empty-title="Your teaching profile is not set up yet"
      empty-text="Your account exists, but it is not linked to a teacher record, so there is nothing to count yet. Ask an administrator to add you as a teacher, then reload this page." />

    <template v-else>
      <section class="page__tiles" aria-label="Totals">
        <StatCard label="Enrolled students" icon="users" :value="enrolledStudentsCount" :loading="loading"
          to="/teacher/enrollments" />
        <StatCard label="To-dos" icon="tasks" :value="todoCount" :loading="loading" to="/teacher/todos" />
        <StatCard label="Subjects offered" icon="book" :value="subjectCount" :loading="loading"
          to="/teacher/subjects" />
      </section>

      <PanelCard title="Upcoming events" :loading="loading" :empty="!events.length" empty-title="No events scheduled"
        empty-text="School events appear here as soon as an administrator adds them.">
        <EventList :events="events" />
      </PanelCard>
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
  name: "TeacherDashboard",
  components: { StatCard, PanelCard, EventList },
  data() {
    return {
      enrolledStudentsCount: 0,
      subjectCount: 0,
      todoCount: 0,
      events: [],
      loading: true,
      // Set when /teacher/stats answers 404: the account exists but has no
      // `teachers` row, so there are no real figures to show.
      profileMissing: false,
      statsError: "",
    };
  },
  mounted() {
    this.checkAccess();
    this.fetchStatsData();
  },
  methods: {
    async checkAccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
    },
    /* The old `fetchDashboardData()` lived here.  It fetched `/teacher/dashboard`,
       which answers only a welcome message, and pushed to /login on *any* error
       — so a network blip signed the user out.  This request owns the state now,
       and nothing needed that one. */
    async fetchStatsData() {
      this.loading = true;
      this.profileMissing = false;
      this.statsError = "";
      try {
        const response = await axios.get("/teacher/stats");
        const stats = response.data.data;
        this.enrolledStudentsCount = stats.enrolled_students_count;
        this.subjectCount = stats.subject_count;
        // The backend splits these; the tile shows the one workload figure.
        this.todoCount = stats.distinct_question_count + stats.todo_count;
        // Despite the name this is the whole event list, not a count.
        this.events = stats.event_count || [];
      } catch (error) {
        if (error.response?.status === 401) {
          this.$router.push("/login");
        } else if (error.response?.status === 404) {
          this.profileMissing = true;
        } else {
          this.statsError = apiErrorMessage(
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

