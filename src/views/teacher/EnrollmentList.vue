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
            <th class="py-2 px-4 text-gray-700 font-semibold">Actions</th>
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
            <td class="py-2 px-4">
              <button
                class="text-blue-500 hover:underline mr-4"
                @click="editEnrollment(enrollment)"
              >
                Edit
              </button>
              <button
                class="text-red-500 hover:underline"
                @click="deleteEnrollment(enrollment.id)"
              >
                Delete
              </button>
            </td>
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

    <div
      v-if="editingEnrollment"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-md shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Edit Enrollment</h3>
        <div class="mb-4">
          <label class="block mb-2">Student</label>
          <select
            v-model="form.student_id"
            class="p-2 border border-gray-300 rounded-md w-full"
            @change="updateStudentName"
          >
            <option
              v-for="student in students"
              :key="student.id"
              :value="student.id"
            >
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-2">Subject</label>
          <select
            v-model="form.subject_id"
            class="p-2 border border-gray-300 rounded-md w-full"
            @change="updateSubjectTitle"
          >
            <option
              v-for="subject in subjects"
              :key="subject.id"
              :value="subject.id"
            >
              {{ subject.title }}
            </option>
          </select>
        </div>
        <button
          class="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
          @click="updateEnrollment"
        >
          Update
        </button>
        <button
          class="px-4 py-2 ml-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";

export default {
  setup() {
    const enrollments = ref([]);
    const searchQuery = ref("");
    const students = ref([]);
    const subjects = ref([]);
    const editingEnrollment = ref(false);
    const form = ref({
      student_id: "",
      subject_id: "",
    });
    const student_name = ref("");
    const subject_title = ref("");
    const currentEnrollmentId = ref(null);

    const fetchEnrollments = async () => {
      try {
        const response = await axios.get("/teacher/enrollments");
        enrollments.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get("/teacher/getStudents");
        students.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/teacher/getSubjects");
        subjects.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    const filteredEnrollments = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return enrollments.value.filter(
        (enrollment) =>
          enrollment.student.name.toLowerCase().includes(query) ||
          enrollment.subject.title.toLowerCase().includes(query),
      );
    });

    const editEnrollment = (enrollment) => {
      editingEnrollment.value = true;
      form.value.student_id = enrollment.student.id;
      form.value.subject_id = enrollment.subject.id;
      student_name.value = enrollment.student.name;
      subject_title.value = enrollment.subject.title;
      currentEnrollmentId.value = enrollment.id;
    };

    const cancelEdit = () => {
      editingEnrollment.value = false;
      form.value.student_id = "";
      form.value.subject_id = "";
      student_name.value = "";
      subject_title.value = "";
      currentEnrollmentId.value = null;
    };

    const updateEnrollment = async () => {
      try {
        await axios.put(`/teacher/enrollments/${currentEnrollmentId.value}`, {
          student_id: form.value.student_id,
          subject_id: form.value.subject_id,
          student_name: student_name.value,
          subject_title: subject_title.value,
        });
        alert("Enrollment updated successfully");
        fetchEnrollments();
        cancelEdit();
      } catch (error) {
        console.error("Error updating enrollment:", error);
      }
    };

    const deleteEnrollment = async (id) => {
      if (confirm("Are you sure you want to delete this enrollment?")) {
        try {
          await axios.delete(`/teacher/enrollments/${id}`);
          alert("Enrollment deleted successfully");
          fetchEnrollments();
        } catch (error) {
          console.error("Error deleting enrollment:", error);
        }
      }
    };

    const updateStudentName = () => {
      const selectedStudent = students.value.find(
        (student) => student.id === form.value.student_id,
      );
      student_name.value = selectedStudent ? selectedStudent.name : "";
    };

    const updateSubjectTitle = () => {
      const selectedSubject = subjects.value.find(
        (subject) => subject.id === form.value.subject_id,
      );
      subject_title.value = selectedSubject ? selectedSubject.title : "";
    };

    onMounted(() => {
      fetchEnrollments();
      fetchStudents();
      fetchSubjects();
    });

    return {
      enrollments,
      searchQuery,
      filteredEnrollments,
      editEnrollment,
      deleteEnrollment,
      editingEnrollment,
      form,
      students,
      subjects,
      updateStudentName,
      updateSubjectTitle,
      updateEnrollment,
      cancelEdit,
    };
  },
};
</script>
