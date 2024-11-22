<template>
  <div class="bg-blue-50">
    <div class="min-h-screen flex flex-col lg:flex-row p-6">
      <div class="flex-1 lg:pl-40 md:pl-32 sm:pl-28 pl-6">
        <div class="absolute top-8 sm:left-24 sm:top-5 md:left-40 md:top-3 lg:left-80 lg:top-8">
          <img class="hidden sm:block h-16" src="@/assets/img/clogo.jpg" alt="University Logo" />
        </div>
        <h2 class="text-3xl font-bold mb-6 text-center text-blue-900">Student Dashboard</h2>
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
                      d="M12 11a4 4 0 110-8 4 4 0 010 8zm-2 1v2a4 4 0 018 0v2M5.5 20.5h13" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold mb-2 text-gray-800">Subjects Offered</h3>
                  <p class="text-2xl font-bold text-gray-900">{{ subjectCount }}</p>
                </div>
              </div>
            </div>
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
                  <h3 class="text-xl font-semibold mb-2 text-gray-800">Tasks Given</h3>
                  <p class="text-2xl font-bold text-gray-900">{{ tasksGivenCount }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-12 mt-6">
            <div class="bg-white p-6 rounded-lg shadow-lg lg:col-start-3 lg:col-span-10">
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
      <div class="bg-white p-6 rounded-lg shadow-lg w-full lg:w-1/4 h-auto mt-6 lg:mt-0 lg:ml-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-800 text-center">Schedule</h3>
        <div v-if="schedules && schedules.length">
          <ul class="space-y-4">
            <li v-for="schedule in schedules" :key="schedule.id" class="p-4 border-b border-gray-200">
              <h4 class="text-lg font-semibold text-blue-800">{{ schedule.title }}</h4>
              <p class="text-blue-900">
                Teacher Name: {{ schedule.name }}<br />
                Description: {{ schedule.description }}<br />
                Schedule: {{ schedule.schedule }}<br />
              </p>
            </li>
          </ul>
        </div>
        <p v-else class="text-gray-600 text-lg font-medium text-center mt-6">No schedules available.</p>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "@/axios";
export default {
  name: "StudentDashboard",
  data() {
    return {
      loading: true,
      subjectCount: 0,
      tasksGivenCount: 0,
      schedules: [],
      events: [],
      stats: {
        totalSubjects: 0,
        totalTasks: 0,
      },
    };
  },
  mounted() {
    this.checkAccess();
    this.loadDashboardData();
    this.loadStatsData();
  },
  methods: {
    async checkAccess() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
    },
    async loadDashboardData() {
      try {
        this.loading = false;
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
        this.$router.push("/login");
      }
    },
    async loadStatsData() {
      try {
        const response = await axios.get("/student/stats");
        this.subjectCount = response.data.subjectCount;
        this.tasksGivenCount = response.data.taskGivenCount;
        if (response.data.events) {
          this.events = response.data.events;
        }
        if (response.data.scheduleCount && response.data.scheduleCount.length) {
          this.schedules = response.data.scheduleCount;
        }
        this.stats.totalSubjects = response.data.subjectCount;
        this.stats.totalTasks = response.data.taskGivenCount;
      } catch (error) {
        console.error("Error fetching stats:", error);
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
