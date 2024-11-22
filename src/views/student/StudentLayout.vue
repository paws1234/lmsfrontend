<template>
    <div class="student-layout">
      <Sidebar />
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from "./StudentSidebar.vue"; 
  
  export default {
    name: "StudentLayout",
    components: {
      Sidebar,
    },
  };
  </script>
  
  <style scoped>
  /* For screens larger than 769px */
  @media (min-width: 769px) {
    .student-layout {
      display: flex;
      height: 100vh; /* Ensure it takes the full height */
    }
  
    .main-content {
      flex-grow: 1; /* Ensure the content takes up remaining space */
      padding: 1rem;
      background-color: #f7fafc; /* Optional: Add a background color for contrast */
      overflow-y: auto; /* Allows scrolling if content overflows */
    }
  }
  
  /* For screens smaller than 768px */
  @media (max-width: 768px) {
    .student-layout {
      display: block; /* Stack sidebar and content vertically */
    }
  
    .main-content {
      margin-left: 0;
      width: 100%; /* Full width */
      padding: 1rem;
      background-color: #f7fafc;
      overflow-y: auto;
    }
  }
  
  /* Global styles for both screen sizes */
  .student-layout {
    position: relative;
  }
  
  .main-content {
    transition: margin-left 0.3s ease; /* Smooth transition when sidebar is toggled */
  }
  </style>
  