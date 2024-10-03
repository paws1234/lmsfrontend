<template>
  <div class="min-h-screen bg-blue-50 p-6 flex items-center justify-center">
    <div class="max-w-lg w-full bg-blue-100 p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        {{ isEditing ? "Edit Teacher" : "Create Teacher" }}
      </h1>

      <form class="space-y-6" @submit.prevent="submitForm">
        <div>
          <label
            for="name"
            class="block text-md font-bold text-blue-900 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            v-model="name"
            name="name"
            type="text"
            placeholder="Enter teacher name"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-md font-bold text-blue-900 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            placeholder="Enter teacher email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-md font-bold text-blue-900 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            placeholder="Enter password"
            :required="!isEditing"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="confirm-password"
            class="block text-md font-bold text-blue-900 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            name="confirm-password"
            type="password"
            placeholder="Confirm password"
            :required="!isEditing"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div
          v-if="password && confirmPassword && password !== confirmPassword"
          class="text-red-500 text-sm"
        >
          Passwords do not match
        </div>

        <div class="flex flex-col gap-4">
          <button
            type="submit"
            class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ isEditing ? "Update" : "Create" }}
          </button>
          <router-link
            to="/admin/teachers"
            class="w-full inline-block px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isEditing: false,
    };
  },
  mounted() {
    if (this.$route.params.id) {
      this.isEditing = true;
      this.fetchTeacher(this.$route.params.id);
    }
  },
  methods: {
    async fetchTeacher(id) {
      try {
        const response = await axios.get(`/admin/teachers/${id}`);
        this.name = response.data.name;
        this.email = response.data.email;
      } catch (error) {
        console.error("Error fetching teacher:", error);
      }
    },
    async submitForm() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const method = this.isEditing ? "PUT" : "POST";
        const url = this.isEditing
          ? `/admin/teachers/${this.$route.params.id}`
          : "/admin/teachers";
        await axios({
          method,
          url,
          data: {
            name: this.name,
            email: this.email,
            password: this.password,
          },
        });
        this.$router.push("/admin/teachers");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  },
};
</script>

<style scoped></style>
