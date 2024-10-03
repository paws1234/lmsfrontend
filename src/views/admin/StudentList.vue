<template>
  <div class="min-h-screen bg-blue-50 p-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4 text-center">
        Student List
      </h1>
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center space-y-4"
      >
        <div class="loader"></div>
        <p class="text-blue-600 text-lg font-medium">Loading...</p>
      </div>
      <p v-else-if="error" class="text-red-600 text-lg font-medium text-center">
        Error loading data. Please try again later.
      </p>
      <p
        v-if="!students.length && !loading && !error"
        class="text-gray-600 text-lg font-medium text-center"
      >
        No students found.
      </p>
      <router-link
        to="/admin/students/create"
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
      >
        Create New Student
      </router-link>
    </header>
    <div class="bg-blue-100 p-6 rounded-lg shadow-md">
      <ul class="space-y-4">
        <li
          v-for="student in students"
          :key="student.id"
          class="flex justify-between items-center p-4 border-b border-gray-200"
        >
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-blue-900">
              Name: {{ student.name }}
            </h2>
            <p class="text-blue-900">Email: {{ student.email }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 space-x-4">
            <router-link
              :to="`/admin/students/${student.id}`"
              class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              Update
            </router-link>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
              @click="openDeleteModal(student.id)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <Modal
      :is-visible="showModal"
      title="Confirm Deletion"
      message="Are you sure you want to delete this student? This action cannot be undone."
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<script>
import axios from "@/axios";
import Modal from "@/views/ModalPopup.vue";

export default {
  components: {
    Modal,
  },
  data() {
    return {
      students: [],
      loading: true,
      error: false,
      showModal: false,
      studentToDelete: null,
    };
  },
  mounted() {
    this.fetchStudents();
  },
  methods: {
    async fetchStudents() {
      this.loading = true;
      this.error = false;
      try {
        const response = await axios.get("/admin/students");
        this.students = response.data.students;
      } catch (error) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    openDeleteModal(id) {
      this.studentToDelete = id;
      this.showModal = true;
    },

    async handleConfirmDelete() {
      try {
        await axios.delete(`/admin/students/${this.studentToDelete}`);
        this.fetchStudents();
        this.showModal = false;
      } catch (error) {
        this.error = true;
        this.showModal = false;
      }
    },

    handleCancelDelete() {
      this.showModal = false;
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
</style>
