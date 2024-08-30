<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Teacher List
      </h1>
      <div v-if="loading" class="flex justify-center items-center space-x-2">
        <svg
          class="w-6 h-6 text-blue-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 12a8 8 0 1 1 8 8A8 8 0 0 1 4 12z"
          ></path>
        </svg>
        <p class="text-blue-600">Loading...</p>
      </div>
      <p v-else-if="error" class="text-red-600">
        Error loading data. Please try again later.
      </p>
      <p v-if="!teachers.length && !loading && !error">No teachers found.</p>
      <router-link
        to="/admin/teachers/create"
        class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create New Teacher
      </router-link>
    </header>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <ul class="space-y-4">
        <li
          v-for="teacher in teachers"
          :key="teacher.id"
          class="flex justify-between items-center p-4 border-b border-gray-200"
        >
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-800">
              Name: {{ teacher.name }}
            </h2>
            <p class="text-gray-600">Email: {{ teacher.email }}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <router-link
              :to="`/admin/teachers/${teacher.id}`"
              class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update
            </router-link>
            <button
              @click="confirmDelete(teacher.id)"
              class="ml-4 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <ConfirmationModal
      :isVisible="isModalVisible"
      title="Confirm Deletion"
      message="Are you sure you want to delete this teacher?"
      @confirm="deleteTeacher"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import axios from "@/axios";

import ConfirmationModal from "@/views/ModalPopup.vue";
export default {
  components: {
    ConfirmationModal,
  },
  data() {
    return {
      teachers: [],
      loading: true,
      error: false,
      isModalVisible: false,
      teacherToDelete: null,
    };
  },
  mounted() {
    this.fetchTeachers();
  },
  methods: {
    async fetchTeachers() {
      this.loading = true;
      this.error = false;
      try {
        const response = await axios.get("/admin/teachers");
        this.teachers = response.data.teachers;
      } catch (error) {
        console.error("Error fetching teachers:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    confirmDelete(id) {
      this.teacherToDelete = id;
      this.isModalVisible = true;
    },

    async deleteTeacher() {
      if (this.teacherToDelete) {
        try {
          await axios.delete(`/admin/teachers/${this.teacherToDelete}`);
          this.fetchTeachers();
        } catch (error) {
          console.error("Error deleting teacher:", error);
        } finally {
          this.isModalVisible = false;
          this.teacherToDelete = null;
        }
      }
    },

    cancelDelete() {
      this.isModalVisible = false;
      this.teacherToDelete = null;
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

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
