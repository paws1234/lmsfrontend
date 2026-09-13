<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Institution overview</p>
      <h1 class="page__title">Admin Dashboard</h1>
      <p class="page__lead">
        Totals across the school, and what is coming up on the calendar.
      </p>
    </header>

    <p v-if="loading" class="sr-only" role="status">Loading dashboard…</p>

    <p v-if="statsError" class="alert alert-error" role="alert">
      {{ statsError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchData">
        Try again
      </button>
    </p>

    <section class="page__tiles" aria-label="Totals">
      <StatCard label="Students" icon="users" :value="studentCount" :loading="loading" to="/admin/students" />

      <StatCard label="Teachers" icon="user" :value="teacherCount" :loading="loading" to="/admin/teachers" />

      <StatCard label="Courses" icon="book" :value="courseCount" :loading="loading" to="/admin/courses" />
    </section>

    <p v-if="eventsError" class="alert alert-error" role="alert">
      {{ eventsError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchData">
        Try again
      </button>
    </p>

    <PanelCard v-else title="School events" :action="{ to: '/admin/event-handlers', label: 'Manage events' }"
      :loading="loading" :empty="!eventHandlers.length" empty-title="No events yet"
      empty-text="Events added under Events appear here, and on every dashboard.">
      <EventList :events="eventHandlers" />
    </PanelCard>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { apiErrorMessage } from "@/apiError";
import StatCard from "@/components/StatCard.vue";
import PanelCard from "@/components/PanelCard.vue";
import EventList from "@/components/EventList.vue";

export default {
  name: "AdminDashboard",
  components: { StatCard, PanelCard, EventList },
  setup() {
    const studentCount = ref(0);
    const teacherCount = ref(0);
    const courseCount = ref(0);
    const eventHandlers = ref([]);
    const loading = ref(true);
    const statsError = ref("");
    const eventsError = ref("");

    /**
     * Writes the endpoint's `count` into `target`, or `null` when the request
     * fails.  `null` is deliberately not the same as `0`: the tile renders it
     * as an em dash, so a failed request cannot be read as a real total of zero
     * (which is what this page used to do, silently).
     */
    const loadCount = async (url, target) => {
      try {
        const response = await axios.get(url);
        target.value = response.data.count ?? null;
      } catch (error) {
        target.value = null;
        // The first failure speaks for all of them: one dead endpoint would
        // otherwise stack three identical alerts.
        if (!statsError.value) {
          statsError.value = apiErrorMessage(
            error,
            "We couldn't load the dashboard totals.",
          );
        }
      }
    };

    const loadEvents = async () => {
      try {
        const response = await axios.get("/admin/event-handlers");
        eventHandlers.value = response.data;
      } catch (error) {
        eventsError.value = apiErrorMessage(
          error,
          "We couldn't load the school events.",
        );
      }
    };

    const fetchData = async () => {
      loading.value = true;
      statsError.value = "";
      eventsError.value = "";
      await Promise.all([
        loadCount("/admin/students", studentCount),
        loadCount("/admin/teachers", teacherCount),
        loadCount("/admin/courses", courseCount),
        loadEvents(),
      ]);
      loading.value = false;
    };

    onMounted(fetchData);

    return {
      studentCount,
      teacherCount,
      courseCount,
      eventHandlers,
      loading,
      statsError,
      eventsError,
      fetchData,
    };
  },
};
</script>

