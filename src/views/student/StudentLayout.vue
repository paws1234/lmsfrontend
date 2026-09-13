<template>
  <div class="app-layout">
    <AppSidebar title="Student" subtitle="Student portal" :items="nav" />
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  name: "StudentLayout",
  components: {
    AppSidebar,
  },
  data() {
    return {
      nav: [
        { to: "/student/tasks", label: "Tasks", icon: "tasks" },
        { to: "/student/studentlists", label: "Enrollments", icon: "book" },
        { to: "/student/scores", label: "Scores", icon: "chart" },
      ],
    };
  },
};
</script>
