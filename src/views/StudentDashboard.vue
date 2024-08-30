<template>
  <div
    class="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-extrabold text-gray-900 mb-6 text-center">
        Student Dashboard
      </h2>

      <div class="text-center">
        <button
          @click="logout"
          class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "StudentDashboard",
  mounted() {
    this.checkAccess();
  },
  methods: {
    async checkAccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      try {
        const response = await axios.get("/student/dashboard");
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
        this.$router.push("/login");
      }
    },
    async logout() {
      try {
        await axios.post("/logout");
        localStorage.removeItem("token");
        this.$router.push("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },
  },
};
</script>

<style scoped></style>
