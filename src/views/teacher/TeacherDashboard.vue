<template>
  <div class="bg-blue-50">
    <div class="min-h-screen flex flex-col p-6">
      <div class="absolute top-8 sm:left-24 sm:top-5 md:left-40 md:top-3 lg:left-80 lg:top-8">
        <img class="hidden sm:block h-16" src="@/assets/img/clogo.jpg" alt="University Logo" />
      </div>
      <h2 class="text-3xl font-bold mb-6 text-center text-blue-900">Teacher Dashboard</h2>
      <div v-if="loading" class="flex flex-col items-center justify-center h-64">
        <div class="loader-container">
          <div class="loader"></div>
          <p class="text-xl text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
      <div v-else class="flex flex-col gap-6">
        <div class="flex flex-wrap gap-6 mt-6 justify-center">
          <div class="w-full sm:w-1/2 lg:w-1/4 xl:w-1/5">
            <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 justify-center">
              <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 text-blue-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.121 19.121A1.5 1.5 0 015.5 17H18.5a1.5 1.5 0 01.379 2.121M15 7A3 3 0 1111 7m4 0a4 4 0 00-8 0m4 8a5.5 5.5 0 00-6 0" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">Enrolled Students</h3>
                <p class="text-2xl font-bold text-gray-900">{{ enrolledStudentsCount }}</p>
              </div>
            </div>
          </div>
          <div class="w-full sm:w-1/2 lg:w-1/4 xl:w-1/5">
            <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 justify-center">
              <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 text-blue-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 11a4 4 0 110-8 4 4 0 010 8zm-2 1v2a4 4 0 018 0v2M5.5 20.5h13" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">To-Do Count</h3>
                <p class="text-2xl font-bold text-gray-900">{{ todoCount }}</p>
              </div>
            </div>
          </div>
          <div class="w-full sm:w-1/2 lg:w-1/4 xl:w-1/5">
            <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 justify-center">
              <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2 text-blue-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 11a4 4 0 110-8 4 4 0 010 8zm-2 1v2a4 4 0 018 0v2M5.5 20.5h13" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">Subjects Offered</h3>
                <p class="text-2xl font-bold text-gray-900">{{ subjectCount }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h3 class="text-xl font-semibold mb-4 text-gray-800 text-center">Upcoming Events</h3>
          <div v-if="events && events.length">
            <ul class="space-y-4">
              <li v-for="event in events" :key="event.id" class="p-4 border-b border-gray-200">
                <h4 class="text-lg font-semibold text-blue-800">{{ event.name }}</h4>
                <p class="text-blue-900">
                  Description: {{ event.description }}<br />
                  Date: {{ event.date }}
                </p>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-600 text-lg font-medium text-center mt-6">No events scheduled.</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
export default {
  name: "TeacherDashboard",
  data() {
    return {
      enrolledStudentsCount: 0,
      subjectCount: 0,
      events: [],
    };
  },
  mounted() {
    this.checkAccess();
    this.fetchDashboardData();
    this.fetchStatsData();
  },
  methods: {
    async checkAccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
    },
    async fetchDashboardData() {
      try {
        const response = await axios.get("/teacher/dashboard");
        if (response.data.status === 'success') {
          console.log("Dashboard data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
        this.$router.push("/login");
      }
    },
    async fetchStatsData() {
      try {
        const response = await axios.get("/teacher/stats");
        if (response.data.status === 'success') {
          this.enrolledStudentsCount = response.data.data.enrolled_students_count;
          this.subjectCount = response.data.data.subject_count;
          this.todoCount = response.data.data.distinct_question_count + response.data.data.todo_count;
          this.events = response.data.data.event_count;
        }
      } catch (error) {
        console.error("Error fetching teacher stats:", error);
        this.$router.push("/login");
      }
    },
    async logout() {
      try {
        await axios.post("/logout");
        localStorage.removeItem("token");
        this.$router.push("/login");
      } catch (error) {
        // `error.response` is undefined when the request never reached the
        // server, so the previous `error.response.data.message` threw from
        // inside this very catch block.  The helper cannot throw and
        // understands both the `message` and `error` body keys.
        console.error("Logout error:", apiErrorMessage(error, error.message));
      }
    },
  },
};
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.loader-container {
  text-align: center;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1.5s linear infinite;
  margin: 0 auto;
}

.loader-container p {
  margin-top: 1rem;
  font-weight: 500;
  animation: pulse 1.5s infinite;
}
</style>

