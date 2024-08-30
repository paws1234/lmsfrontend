<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4 text-center">
        Create Course
      </h1>
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center space-y-4 mb-6"
      >
        <div class="loader"></div>
        <p class="text-blue-600 text-lg font-medium">Creating course...</p>
      </div>
      <form v-else @submit.prevent="createCourse">
        <div class="mb-4">
          <label
            class="block text-gray-700 text-sm font-medium mb-2"
            for="title"
            >Title</label
          >
          <input
            id="title"
            v-model="course.title"
            type="text"
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            placeholder="Enter course title"
            aria-required="true"
            aria-describedby="title-helper"
          />
        </div>
        <div class="mb-4">
          <label
            class="block text-gray-700 text-sm font-medium mb-2"
            for="description"
            >Description</label
          >
          <textarea
            id="description"
            v-model="course.description"
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            rows="5"
            placeholder="Enter course description"
            aria-required="true"
            aria-describedby="description-helper"
          ></textarea>
        </div>
        <div class="flex space-x-4">
          <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          >
            Save
          </button>
          <router-link
            to="/admin/courses"
            class="inline-block px-6 py-3 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 text-center"
          >
            Back to List
          </router-link>
        </div>
      </form>
    </header>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  data() {
    return {
      course: {
        title: "",
        description: "",
      },
      loading: false,
    };
  },
  methods: {
    async createCourse() {
      this.loading = true;
      try {
        await axios.post("/admin/courses", this.course);
        this.$router.push("/admin/courses");
      } catch (error) {
        console.error("Error creating course:", error);
      } finally {
        this.loading = false;
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

.loader-container {
  text-align: center;
}
</style>
