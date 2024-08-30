<template>
  <div class="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
    <div class="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        {{ isEditing ? "Edit Student" : "Create Student" }}
      </h1>

      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
            >Name</label
          >
          <input
            v-model="name"
            id="name"
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
            class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <input
            v-model="email"
            id="email"
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
            class="block text-sm font-medium text-gray-700 mb-1"
            >Password</label
          >
          <input
            v-model="password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            :required="!isEditing"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Confirm Password</label
          >
          <input
            v-model="confirmPassword"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div class="flex flex-col gap-4">
          <button
            type="submit"
            class="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ isEditing ? "Update" : "Create" }}
          </button>
          <router-link
            to="/admin/students"
            class="w-full inline-block px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
          >
            Back to List
          </router-link>
        </div>
        <div
          v-if="feedbackMessage"
          class="text-sm font-medium text-gray-700 mt-4"
        >
          <p
            :class="
              feedbackType === 'error' ? 'text-red-600' : 'text-green-600'
            "
          >
            {{ feedbackMessage }}
          </p>
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
      feedbackMessage: "",
      feedbackType: "",
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
        const response = await axios.get(`/admin/students/${id}`);
        this.name = response.data.name;
        this.email = response.data.email;
      } catch (error) {
        this.feedbackMessage =
          "Error fetching teacher details. Please try again.";
        this.feedbackType = "error";
      }
    },
    async submitForm() {
      if (!this.isEditing && this.password !== this.confirmPassword) {
        this.feedbackMessage = "Passwords do not match. Please try again.";
        this.feedbackType = "error";
        return;
      }

      try {
        const method = this.isEditing ? "PUT" : "POST";
        const url = this.isEditing
          ? `/admin/students/${this.$route.params.id}`
          : "/admin/students";
        await axios({
          method,
          url,
          data: {
            name: this.name,
            email: this.email,
            password: this.password,
          },
        });
        this.feedbackMessage = this.isEditing
          ? "Student updated successfully!"
          : "Student created successfully!";
        this.feedbackType = "success";
        this.$router.push("/admin/students");
      } catch (error) {
        this.feedbackMessage = "Error submitting form. Please try again.";
        this.feedbackType = "error";
      }
    },
  },
};
</script>

<style scoped></style>
