<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Teacher Dashboard</h2>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "TeacherDashboard",
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
        const response = await axios.get("/teacher/dashboard");
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
        this.$router.push("/login");
      }
    },
    async logout() {
      try {
        await axios.post("/logout");
        localStorage.removeItem("token");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error.response.data.message);
      }
    },
  },
};
</script>

<style scoped></style>
