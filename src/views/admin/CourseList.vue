<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4 text-center">Courses</h1>
      <router-link
        to="/admin/courses/create"
        class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
      >
        Create New Course
      </router-link>
    </header>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center space-y-4 mb-6"
    >
      <div class="loader"></div>
      <p class="text-blue-600 text-lg font-medium">Loading courses...</p>
    </div>

    <p v-if="error" class="text-red-600 text-lg font-medium text-center mb-6">
      Error loading courses. Please try again later.
    </p>

   
    <p
      v-if="!loading && !error && !courses.length"
      class="text-gray-600 text-lg font-medium text-center mb-6"
    >
      No courses found.
    </p>

    
    <div v-if="courses.length" class="bg-white p-6 rounded-lg shadow-md">
      <ul class="space-y-4">
        <li
          v-for="course in courses"
          :key="course.id"
          class="p-4 border-b border-gray-200 flex items-start justify-between"
        >
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-800">
              {{ course.title }}
            </h2>
            <p class="text-gray-600">{{ course.description }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 space-x-4">
            <router-link
              :to="`/admin/courses/${course.id}/edit`"
              class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              Edit
            </router-link>
            <button
              @click="deleteCourse(course.id)"
              class="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  data() {
    return {
      courses: [],
      loading: true,
      error: false,
    };
  },
  mounted() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      this.loading = true;
      this.error = false;
      try {
        const response = await axios.get("/admin/courses");
        this.courses = response.data.courses; 
      } catch (error) {
        console.error("Error fetching courses:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async deleteCourse(id) {
      if (confirm("Are you sure you want to delete this course?")) {
        try {
          await axios.delete(`/admin/courses/${id}`);
          this.fetchCourses(); 
        } catch (error) {
          console.error("Error deleting course:", error);
          this.error = true;
        }
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


.loader {
  border: 8px solid #f3f3f3; 
  border-top: 8px solid #3498db; 
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1.5s linear infinite;
}


input:focus,
textarea:focus,
button:focus,
a:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}
</style>
