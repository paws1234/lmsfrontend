<template>
  <div class="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Create Enrollment</h2>
    <form
      class="w-full max-w-lg bg-white shadow-lg rounded-lg p-8"
      @submit.prevent="createEnrollment"
    >
      <div class="mb-4">
        <label
          for="student"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Student</label
        >
        <select
          v-model="form.student_id"
          class="block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          @change="updateStudentName"
        >
          <option disabled value="">Select a student</option>
          <option
            v-for="student in students"
            :key="student.id"
            :value="student.id"
          >
            {{ student.name }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label
          for="subject"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Subject</label
        >
        <select
          v-model="form.subject_id"
          class="block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          @change="updateSubjectTitle"
        >
          <option disabled value="">Select a subject</option>
          <option
            v-for="subject in subjects"
            :key="subject.id"
            :value="subject.id"
          >
            {{ subject.title }}
          </option>
        </select>
      </div>
      <div class="flex justify-between">
        <router-link to="/teacher/enrollments">
          <button
            type="button"
            class="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
          >
            Go Back
          </button>
        </router-link>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
        >
          Enroll
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  emits: ["enrollmentCreated"],
  data() {
    return {
      form: {
        student_id: "",
        subject_id: "",
      },
      students: [],
      subjects: [],
      student_name: "",
      subject_title: "",
    };
  },
  created() {
    this.fetchStudents();
    this.fetchSubjects();
  },
  methods: {
    fetchStudents() {
      axios
        .get("/teacher/getStudents")
        .then((response) => {
          this.students = response.data;
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
    },
    fetchSubjects() {
      axios
        .get("/teacher/getSubjects")
        .then((response) => {
          this.subjects = response.data;
        })
        .catch((error) => {
          console.error("Error fetching subjects:", error);
        });
    },
    updateStudentName() {
      const selectedStudent = this.students.find(
        (student) => student.id === this.form.student_id,
      );
      this.student_name = selectedStudent ? selectedStudent.name : "";
    },
    updateSubjectTitle() {
      const selectedSubject = this.subjects.find(
        (subject) => subject.id === this.form.subject_id,
      );
      this.subject_title = selectedSubject ? selectedSubject.title : "";
    },
    createEnrollment() {
      if (!this.student_name || !this.subject_title) {
        alert("Please select both a student and a subject.");
        return;
      }

      const enrollmentData = {
        student_name: this.student_name,
        subject_name: this.subject_title,
      };

      axios
        .post("/teacher/enrollments", enrollmentData)
        .then((response) => {
          alert("Enrollment created successfully");
          this.form.student_id = "";
          this.form.subject_id = "";
          this.student_name = "";
          this.subject_title = "";
          this.$emit("enrollmentCreated", response.data);
        })
        .catch((error) => {
          console.error("Error creating enrollment:", error);
        });
    },
  },
};
</script>

<style scoped></style>
