<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="mb-6 justify-between">
      <h2 class="text-3xl font-bold text-gray-900 text-center">Subjects</h2>
      <router-link
        to="/teacher/subjects/create"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create New Subject
      </router-link>
    </header>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loader"></div>
    </div>

    <div v-else>
      <div v-if="subjects.length === 0" class="text-gray-500 text-center">
        No subjects available.
      </div>
      <table
        v-else
        class="w-full bg-white rounded-lg shadow-md border border-gray-200"
      >
        <thead>
          <tr class="bg-gray-200 text-gray-700">
            <th class="p-4 text-left">Title</th>
            <th class="p-4 text-left">Description</th>
            <th class="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.id">
            <td class="p-4">{{ subject.title }}</td>
            <td class="p-4">{{ subject.description }}</td>
            <td class="p-4 text-center">
              <router-link
                :to="{ name: 'SubjectEdit', params: { id: subject.id } }"
                class="text-blue-500 hover:underline"
              >
                Edit
              </router-link>
              <button
                @click="deleteSubject(subject.id)"
                class="ml-4 text-red-500 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";

export default {
  name: "SubjectList",
  setup() {
    const subjects = ref([]);
    const loading = ref(true);

    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/teacher/subjects");
        subjects.value = response.data;
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        loading.value = false;
      }
    };

    const deleteSubject = async (id) => {
      if (confirm("Are you sure you want to delete this subject?")) {
        try {
          await axios.delete(`/teacher/subjects/${id}`);
          fetchSubjects();
        } catch (error) {
          console.error("Error deleting subject:", error);
        }
      }
    };

    onMounted(fetchSubjects);

    return {
      subjects,
      loading,
      deleteSubject,
    };
  },
};
</script>

<style scoped>
.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
