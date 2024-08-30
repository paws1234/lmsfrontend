<template>
  <div>
    <button
      @click="toggleSidebar"
      v-if="!isSidebarOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-3 text-gray-800 bg-white rounded-md border border-gray-300 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>

    <div
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
      class="sidebar fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64 lg:flex lg:flex-col lg:static"
    >
      <div class="p-4">
        <router-link
          to="/teacher/dashboard"
          class="text-2xl font-semibold mb-6 block text-center text-white hover:text-gray-300"
        >
          Teacher
        </router-link>
        <ul class="space-y-4">
          <li>
            <router-link
              to="/teacher/subjects"
              class="block px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/70"
              >Subjects</router-link
            >
          </li>
          <li>
            <router-link
              to="/teacher/enrollments"
              class="block px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/70"
              >Enrollments</router-link
            >
          </li>
          <button
            @click="logout"
            class="mt-auto w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </ul>
      </div>
    </div>

    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="overlay lg:hidden"
    ></div>
  </div>
</template>

<script>
import axios from "@/axios";
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "TeacherSidebar",
  setup() {
    const isSidebarOpen = ref(false);
    const router = useRouter();

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    const logout = async () => {
      try {
        await axios.post("/logout");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.push("/login");
      } catch (error) {
        console.error(
          "Logout error:",
          error.response?.data?.message || error.message
        );
      }
    };

    return {
      isSidebarOpen,
      toggleSidebar,
      logout,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 16rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #374151;
  padding: 1rem;
  z-index: 40;
}

.logout-button {
  margin-top: auto;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #c82333;
}

.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
}
</style>
