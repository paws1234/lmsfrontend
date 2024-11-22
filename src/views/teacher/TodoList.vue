<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">TODO List</h2>
    <div class="mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search TODOs..."
        class="p-3 border border-gray-300 rounded-lg shadow-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300 ease-in-out" />
    </div>
    <div class="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200 border-b">
            <th class="py-3 px-5 text-gray-700 font-semibold">Type</th>
            <th class="py-3 px-5 text-gray-700 font-semibold">Title</th>
            <th class="py-3 px-5 text-gray-700 font-semibold">Description</th>
            <th class="py-3 px-5 text-gray-700 font-semibold">Subject</th>
            <th class="py-3 px-5 text-gray-700 font-semibold">Attachments</th>
            <th class="py-3 px-5 text-gray-700 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="todo in filteredTodos" :key="todo.id"
            class="border-b hover:bg-gray-50 transition-colors duration-300">
            <td class="py-2 px-4">{{ todo.type }}</td>
            <td class="py-2 px-4">{{ todo.title }}</td>
            <td class="py-2 px-4">{{ todo.description }}</td>
            <td class="py-2 px-4">{{ todo.subject_name || 'No Subject' }}</td>
            <td class="py-2 px-4">
              <a v-if="todo.file" :href="todo.file" class="text-blue-500 hover:underline" download>
                View Attachment
              </a>
              <span v-else>No attachment</span>
            </td>
            <td class="py-3 px-5 text-center">
              <router-link :to="{ name: 'TodoEdit', params: { id: todo.id } }"
                class="text-blue-500 hover:underline transition-colors duration-300">
                Edit
              </router-link>
              <button class="ml-4 text-red-500 hover:underline transition-colors duration-300"
                @click="deleteTodo(todo.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-6 flex space-x-4">
      <router-link to="/teacher/todos/create">
        <button
          class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
          Add New TODO
        </button>
      </router-link>
      <router-link to="/teacher/questions/create"
        class="block px-6 py-3 bg-gray-800 text-gray-300 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition duration-300">
        Create CTU FORMS
      </router-link>
      <router-link to="/teacher/questions/list"
        class="block px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300">
        View Questions
      </router-link>
    </div>
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
          todo.description.toLowerCase().includes(query)
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
