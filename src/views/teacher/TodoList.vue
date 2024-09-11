<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">TODO List</h2>
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search TODOs..."
        class="p-2 border border-gray-300 rounded-md w-full max-w-md"
      />
    </div>
    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200 border-b">
            <th class="py-2 px-4 text-gray-700 font-semibold">Type</th>
            <th class="py-2 px-4 text-gray-700 font-semibold">Title</th>
            <th class="py-2 px-4 text-gray-700 font-semibold">Description</th>
            <th class="py-2 px-4 text-gray-700 font-semibold">Attachments</th>
            <th class="py-2 px-4 text-gray-700 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-2 px-4">{{ todo.type }}</td>
            <td class="py-2 px-4">{{ todo.title }}</td>
            <td class="py-2 px-4">{{ todo.description }}</td>
            <td class="py-2 px-4">
              <!-- Check if file exists -->
              <a
                v-if="todo.file"
                :href="todo.file"
                class="text-blue-500 hover:underline"
                download
              >
                View Attachment
              </a>
              <span v-else>No attachment</span>
            </td>
            <td class="py-2 px-4 text-center">
              <router-link
                :to="{ name: 'TodoEdit', params: { id: todo.id } }"
                class="text-blue-500 hover:underline"
              >
                Edit
              </router-link>
              <button
                class="ml-4 text-red-500 hover:underline"
                @click="deleteTodo(todo.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <router-link to="/teacher/todos/create">
      <button
        class="mt-6 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-300"
      >
        Add New TODO
      </button>
    </router-link>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";

export default {
  setup() {
    const todos = ref([]);
    const searchQuery = ref("");

    const fetchTodos = async () => {
      try {
        const response = await axios.get("/teacher/todos");
        todos.value = response.data;
        console.log('Todos:', todos.value); 
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    const deleteTodo = async (id) => {
      if (confirm("Are you sure you want to delete this TODO?")) {
        try {
          await axios.delete(`/teacher/todos/${id}`);
          fetchTodos();
        } catch (error) {
          console.error("Error deleting todo:", error);
        }
      }
    };

    const filteredTodos = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return todos.value.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description.toLowerCase().includes(query),
      );
    });

    onMounted(fetchTodos);

    return {
      todos,
      searchQuery,
      filteredTodos,
      deleteTodo,
    };
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
