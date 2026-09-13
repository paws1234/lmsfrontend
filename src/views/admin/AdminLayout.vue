<template>
  <div class="app-layout">
    <AppSidebar title="Admin" subtitle="Administrator" :items="nav" />
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  name: "AdminLayout",
  components: {
    AppSidebar,
  },
  data() {
    return {
      nav: [
        { to: "/admin/dashboard", label: "Home", icon: "home" },
        { to: "/admin/students", label: "Students", icon: "users" },
        { to: "/admin/teachers", label: "Teachers", icon: "user" },
        { to: "/admin/courses", label: "Courses", icon: "book" },
        { to: "/admin/schedules", label: "ComputerLab", icon: "clock" },
        { to: "/admin/event-handlers", label: "Events", icon: "calendar" },
      ],
    };
  },
};
</script>

