<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-900 text-center">
      Create New Subject
    </h2>
    <form @submit.prevent="createSubject">
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
        Save
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
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "SubjectCreate",
  setup() {
    const form = ref({
      title: "",
      description: "",
    });
    const router = useRouter();

    const createSubject = async () => {
      try {
        await axios.post("/teacher/subjects", form.value);
        router.push("/teacher/subjects");
      } catch (error) {
        console.error("Error creating subject:", error);
      }
    };

    return {
      form,
      createSubject,
    };
  },
};
</script>
