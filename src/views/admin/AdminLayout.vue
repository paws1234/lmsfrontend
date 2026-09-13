<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./AdminSidebar.vue";

export default {
  name: "AdminLayout",
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
/* For screens larger than 769px */
@media (min-width: 769px) {
  .admin-layout {
    display: flex;
    height: 100vh; /* Ensure it takes the full height */
  }

  .main-content {
    flex-grow: 1; /* Ensure the content takes up remaining space */
    padding: 1rem;
    /* Themed rather than a fixed light grey: this is the page surface the
           admin views sit on, so it has to follow the theme. */
      background-color: var(--surface-muted);
    overflow-y: auto; /* Allows scrolling if content overflows */
  }
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
  .admin-layout {
    display: block; /* Stack sidebar and content vertically */
  }

  .main-content {
    margin-left: 0;
    width: 100%; /* Full width */
    padding: 1rem;
    background-color: var(--surface-muted);
    overflow-y: auto;
  }
}

/* Global styles for both screen sizes */
.admin-layout {
  position: relative;
}

.main-content {
  transition: margin-left 0.3s ease; /* Smooth transition when sidebar is toggled */
}
</style>
