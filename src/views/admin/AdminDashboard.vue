<template>
<div class=" bg-blue-50">
  <div class="min-h-screen flex flex-col p-6">

<div class="absolute top-8 sm:left-24 sm:top-5 md:left-40 md:top-3 lg:left-80 lg:top-8">
  <img class=" hidden sm:block h-16" src="@/assets/img/clogo.jpg" alt="University Logo" />
</div>
    <h2 class="text-3xl font-bold mb-6 text-center text-blue-900">
      Admin Dashboard
    </h2>

    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <div class="loader-container">
        <div class="loader"></div>
        <p class="text-xl text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    </div>


    <div v-else class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-6 mt-6">
        <div class="w-full sm:w-1/2 lg:w-1/4">
          <div class="bg-blue-100 p-6 rounded-lg shadow-lg ">
             
            <h3 class="text-xl font-semibold mb-2 text-blue-900">
              Number of Students
            </h3>

            <div class="flex">
            <img
      class=""
      src="@/assets/img/icons8-student-24.png"
      alt="student">
            <p class="text-2xl font-bold text-blue-900 pl-3">{{ studentCount }}</p>
            </div>
          </div>
        </div>


        <div class="w-full sm:w-1/2 lg:w-1/4">
          <div class="bg-blue-100 p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-2 text-blue-900">
              Number of Teachers
            </h3>

 <div class="flex">
             <img
      class=""
      src="@/assets/img/icons8-teacher-24.png"
      alt="teacher">
            <p class="text-2xl font-bold text-blue-900 pl-3">{{ teacherCount }}</p>
          </div>
        </div>
        </div>



  
        <div class="w-full sm:w-1/2 lg:w-1/4">
          <div class="bg-blue-100 p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-2 text-blue-900 pl-3">
              Number of Courses
            </h3>

            <div class="flex">
            <img
      class=""
      src="@/assets/img/icons8-books-30.png"
      alt="courses">
            <p class="text-2xl font-bold text-blue-900 pl-3">{{ courseCount }}</p>
          </div>
        </div>
      </div>
</div>

      <div class="bg-blue-100 p-6 rounded-lg shadow-lg mt-6">
        <h3 class="text-xl font-semibold mb-4 text-blue-900 text-center">
          School Events
        </h3>
        <div v-if="eventHandlers.length">
          <ul class="space-y-4">
            <li
              v-for="eventHandler in eventHandlers"
              :key="eventHandler.id"
              class="p-4 border-b border-gray-200"
            >
              <h4 class="text-lg font-semibold text-blue-800">
                {{ eventHandler.name }}
              </h4>
              <p class="text-blue-900">
                Description: {{ eventHandler.description }}<br />
                Date: {{ eventHandler.date }}
              </p>
            </li>
          </ul>
        </div>
        <p v-else class="text-gray-600 text-lg font-medium text-center mt-6">
          No event handlers found.
        </p>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";

export default {
  name: "AdminDashboard",
  setup() {
    const studentCount = ref(0);
    const teacherCount = ref(0);
    const courseCount = ref(0);
    const eventHandlers = ref([]);
    const loading = ref(true);

    const fetchStudentData = async () => {
      try {
        const response = await axios.get("/admin/students");
        studentCount.value = response.data.count;
      } catch (error) {
        console.error(
          "Error fetching student data:",
          error.response?.data?.message || error.message,
        );
      }
    };

    const fetchTeacherData = async () => {
      try {
        const response = await axios.get("/admin/teachers");
        teacherCount.value = response.data.count;
      } catch (error) {
        console.error(
          "Error fetching teacher data:",
          error.response?.data?.message || error.message,
        );
      }
    };

    const fetchCourseData = async () => {
      try {
        const response = await axios.get("/admin/courses");
        courseCount.value = response.data.count;
      } catch (error) {
        console.error(
          "Error fetching course data:",
          error.response?.data?.message || error.message,
        );
      }
    };

    const fetchEventHandlers = async () => {
      try {
        const response = await axios.get("/admin/event-handlers");
        eventHandlers.value = response.data;
      } catch (error) {
        console.error(
          "Error fetching event handlers:",
          error.response?.data?.message || error.message,
        );
      }
    };

    const fetchData = async () => {
      loading.value = true;
      await Promise.all([
        fetchStudentData(),
        fetchTeacherData(),
        fetchCourseData(),
        fetchEventHandlers(),
      ]);
      loading.value = false;
    };

    onMounted(() => {
      fetchData();
    });

    return {
      studentCount,
      teacherCount,
      courseCount,
      eventHandlers,
      loading,
    };
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
