<template>
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">
      Update Teacher
    </h1>
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center space-y-4 mb-6"
    >
      <div class="loader"></div>
      <p class="text-blue-600 text-lg font-medium">Updating...</p>
    </div>
    <div v-if="error" class="text-red-600 text-lg font-medium mb-6 text-center">
      Error updating data. Please try again later.
    </div>
    <form
      class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg"
      @submit.prevent="submitForm"
    >
      <div class="mb-6">
        <label for="name" class="block text-gray-700 text-lg font-medium mb-2">
          Name
        </label>
        <input
          id="name"
          v-model="teacher.name"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label for="email" class="block text-gray-700 text-lg font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          v-model="teacher.email"
          type="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label
          for="password"
          class="block text-gray-700 text-lg font-medium mb-2"
        >
          Password
        </label>
        <input
          id="password"
          v-model="teacher.password"
          type="password"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div class="flex justify-between items-center mt-6">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          Update
        </button>
        <router-link
          to="/admin/teachers"
          class="bg-gray-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150"
        >
          Back to List
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  data() {
    return {
      teacher: {
        name: "",
        email: "",
        password: "",
      },
      loading: false,
      error: false,
    };
  },
  async created() {
    const id = this.$route.params.id;
    this.loading = true;

    try {
      const response = await axios.get(`/admin/teachers/${id}`);
      this.teacher = response.data;
    } catch (error) {
      console.error("Error fetching teacher:", error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async submitForm() {
      this.loading = true;
      this.error = false;

      try {
        await axios.put(
          `/admin/teachers/${this.$route.params.id}`,
          this.teacher,
        );
        this.$router.push("/admin/teachers");
      } catch (error) {
        console.error("Error updating teacher:", error);
        this.error = true;
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
  width: 60px;
  height: 60px;
  animation: spin 1.5s linear infinite;
}
</style>
