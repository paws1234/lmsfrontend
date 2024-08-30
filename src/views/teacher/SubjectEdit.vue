<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-900 text-center">
      Edit Subject
    </h2>
    <form @submit.prevent="updateSubject">
      <div class="mb-4">
        <label for="title" class="block text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div class="mb-4">
        <label for="description" class="block text-gray-700">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-md mr-4"
      >
        Update
      </button>
      <router-link
        to="/teacher/subjects"
        class="bg-gray-500 text-white px-4 py-2 rounded-md"
      >
        Go to Subjects
      </router-link>
    </form>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "SubjectEdit",
  setup() {
    const form = ref({
      title: "",
      description: "",
    });
    const route = useRoute();
    const router = useRouter();
    const subjectId = route.params.id;

    const fetchSubject = async () => {
      try {
        const response = await axios.get(`/teacher/subjects/${subjectId}`);
        form.value = response.data;
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    };

    const updateSubject = async () => {
      try {
        await axios.put(`/teacher/subjects/${subjectId}`, form.value);
        router.push("/teacher/subjects");
      } catch (error) {
        console.error("Error updating subject:", error);
      }
    };

    onMounted(fetchSubject);

    return {
      form,
      updateSubject,
    };
  },
};
</script>
