<template>
  <div class="teacher-layout">
    <Sidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./TeacherSidebar.vue";

export default {
  name: "TeacherLayout",
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
@media (min-width: 769px) {
  .admin-layout {
    display: flex;
  }

  .main-content {
    margin-left: 16rem;
    padding: 1rem;
    width: calc(100% - 16rem);
  }
}

@media (max-width: 768px) {
  .admin-layout {
    display: block;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }
}
</style>
