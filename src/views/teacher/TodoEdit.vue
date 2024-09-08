<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Edit TODO</h2>
    <form @submit.prevent="updateTodo">
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Type</label>
        <select
          v-model="todo.type"
          class="p-2 border border-gray-300 rounded-md w-full"
        >
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Title</label>
        <input
          v-model="todo.title"
          type="text"
          placeholder="Enter title"
          class="p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Description</label>
        <textarea
          v-model="todo.description"
          placeholder="Enter description"
          class="p-2 border border-gray-300 rounded-md w-full"
        ></textarea>
      </div>

      <div class="mb-4">
        <input
          type="file"
          @change="handleFileUpload"
          class="p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-300"
      >
        Update TODO
      </button>
    </form>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const todo = ref({
      type: "personal",
      title: "",
      description: "",
      file: null, // For handling file upload
    });

    onMounted(async () => {
      try {
        const response = await axios.get(`/teacher/todos/${route.params.id}`);
        todo.value = response.data;
      } catch (error) {
        console.error("Error fetching todo:", error);
      }
    });

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      todo.value.file = file || null; // Update file if selected, or null if not
      console.log("File selected:", file);
    };

    const updateTodo = async () => {
      try {
        const formData = new FormData();
        formData.append("type", todo.value.type);
        formData.append("title", todo.value.title);
        formData.append("description", todo.value.description);

        if (todo.value.file) {
          formData.append("file", todo.value.file);
        }

        // Debugging output
        console.log(
          "FormData to be sent:",
          Object.fromEntries(formData.entries())
        );

        const response = await axios.put(
          `/teacher/todos/${route.params.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Response:", response.data);
        router.push({ name: "TodoList" });
      } catch (error) {
        console.error(
          "Error updating todo:",
          error.response ? error.response.data : error.message
        );
      }
    };

    return {
      todo,
      handleFileUpload,
      updateTodo,
    };
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
