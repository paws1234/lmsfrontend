<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Edit TODO</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Type</label>
        <select
          v-model="todo.type"
          class="p-2 border border-gray-300 rounded-md w-full"
        >
          <option value="">Select Type</option>
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
        <label class="block mb-2 text-gray-700">File</label>
        <input
          type="file"
          class="p-2 border border-gray-300 rounded-md"
          @change="handleFileUpload"
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
      type: "",
      title: "",
      description: "",
      file: null,
    });

    onMounted(async () => {
      try {
        const response = await axios.get(`/teacher/todos/${route.params.id}`);
        todo.value = response.data;
      } catch (error) {
        console.error("Error fetching todo:", error);
        alert("Failed to fetch todo. Please try again.");
      }
    });

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      todo.value.file = file ? file.name : null; // Just store the file name for simplicity
    };

    const handleSubmit = async () => {
      if (validateInput()) {
        try {
          console.log("Updating Todo ID:", route.params.id);

          // Prepare data for update
          const payload = {
            type: todo.value.type,
            title: todo.value.title,
            description: todo.value.description,
            file: todo.value.file,
          };

          // Log payload for debugging
          console.log("Payload:", payload);

          const response = await axios.put(
            `/teacher/todos/${route.params.id}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          console.log("Response:", response.data);
          router.push({ name: "TodoList" });
        } catch (error) {
          console.error(
            "Error updating todo:",
            error.response?.data || error.message,
          );
        }
      }
    };

    const validateInput = () => {
      if (!todo.value.type || !todo.value.title || !todo.value.description) {
        alert("Please fill in all required fields");
        return false;
      }
      return true;
    };

    return {
      todo,
      handleFileUpload,
      handleSubmit,
      validateInput,
    };
  },
};
</script>
