<template>
  <div class="app-layout">
    <AppSidebar title="Teacher" subtitle="Teaching staff" :items="nav" />
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  name: "TeacherLayout",
  components: {
    AppSidebar,
  },
  data() {
    return {
      nav: [
        { to: "/teacher/subjects", label: "Subjects", icon: "book" },
        { to: "/teacher/enrollments", label: "Enrollments", icon: "users" },
        { to: "/teacher/todos", label: "TODOs", icon: "tasks" },
      ],
    };
  },
};
</script>

