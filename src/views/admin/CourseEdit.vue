<template>
  <div class="min-h-screen bg-blue-50 p-6 flex flex-col items-center">
    <div class="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-900 text-center">
        Edit Course
      </h1>
      <form class="space-y-6" @submit.prevent="updateCourse">
        <div class="mb-4">
          <label
            class="block text-blue-900 text-sm font-medium mb-2"
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
            class="block text-blue-900 text-sm font-medium mb-2"
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
            aria-live="polite"
          >
            Save
          </button>
          <router-link
            to="/admin/courses"
            class="inline-block px-6 py-3 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 text-center"
            aria-label="Back to Course List"
          >
            Back to List
          </router-link>
        </div>
      </form>
    </div>
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
    };
  },
  methods: {
    async updateCourse() {
      try {
        await axios.put(`/admin/courses/${this.$route.params.id}`, this.course);
        this.$router.push("/admin/courses");
      } catch (error) {
        console.error("Error updating course:", error);
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
</style>
