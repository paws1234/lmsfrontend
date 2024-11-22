<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="mb-6 flex justify-between items-center">
      <h2 class="text-3xl font-bold text-gray-900">Subjects</h2>
      <router-link
        to="/teacher/subjects/create"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create New Subject
      </router-link>
    </header>

    <div class="mb-4 flex justify-between items-center">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search subjects..."
        class="p-2 border border-gray-300 rounded-md w-full max-w-md"
      />
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loader"></div>
    </div>

    <div v-else>
      <div
        v-if="filteredSubjects.length === 0"
        class="text-gray-500 text-center"
      >
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
            <th class="p-4 text-left">Schedule</th> <!-- Added Schedule Column -->
            <th class="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in filteredSubjects" :key="subject.id">
            <td class="p-4">{{ subject.title }}</td>
            <td class="p-4">{{ subject.description }}</td>
            <td class="p-4">{{ subject.schedule }}</td> <!-- Display the Schedule -->
            <td class="p-4 text-center">
              <router-link
                :to="{ name: 'SubjectEdit', params: { id: subject.id } }"
                class="text-blue-500 hover:underline"
              >
                Edit
              </router-link>
              <button
                class="ml-4 text-red-500 hover:underline"
                @click="deleteSubject(subject.id)"
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
import { ref, onMounted, computed } from "vue";

export default {
  name: "SubjectList",
  setup() {
    const subjects = ref([]);
    const loading = ref(true);
    const searchQuery = ref("");

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

    const filteredSubjects = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return subjects.value.filter(
        (subject) =>
          subject.title.toLowerCase().includes(query) ||
          subject.description.toLowerCase().includes(query) ||
          (subject.schedule && subject.schedule.toLowerCase().includes(query)) // Filter by schedule as well
      );
    });

    onMounted(fetchSubjects);

    return {
      subjects,
      loading,
      searchQuery,
      deleteSubject,
      filteredSubjects,
    };
  },
};
</script>
