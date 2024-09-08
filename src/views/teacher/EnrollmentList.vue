<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Enrollments</h2>
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search enrollments..."
        class="p-2 border border-gray-300 rounded-md w-full max-w-md"
      />
    </div>

    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200 border-b">
            <th class="py-2 px-4 text-gray-700 font-semibold">Students</th>
            <th class="py-2 px-4 text-gray-700 font-semibold">Subjects</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="enrollment in filteredEnrollments"
            :key="enrollment.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-2 px-4">{{ enrollment.student.name }}</td>
            <td class="py-2 px-4">{{ enrollment.subject.title }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <router-link to="/teacher/enrollments/create">
      <button
        class="mt-6 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-300"
      >
        Create Enrollment
      </button>
    </router-link>
  </div>
</template>
<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";

export default {
  setup() {
    const enrollments = ref([]);
    const searchQuery = ref("");

    const fetchEnrollments = async () => {
      try {
        const response = await axios.get("/teacher/enrollments");
        enrollments.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    const filteredEnrollments = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return enrollments.value.filter(
        (enrollment) =>
          enrollment.student.name.toLowerCase().includes(query) ||
          enrollment.subject.title.toLowerCase().includes(query)
      );
    });

    onMounted(fetchEnrollments);

    return {
      enrollments,
      searchQuery,
      filteredEnrollments,
    };
  },
};
</script>
