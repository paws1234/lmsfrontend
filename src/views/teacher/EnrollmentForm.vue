<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Enroll a student</h1>
      <p class="page__lead">
        Puts one student into one subject. They will then see that subject's
        tasks, questions and scores.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <p v-if="notice" class="alert alert-success" role="status">{{ notice }}</p>

    <div class="card card-pad form-narrow">
      <form class="form" @submit.prevent="createEnrollment">
        <div>
          <label class="form-label" for="student">Student</label>
          <select id="student" v-model="form.student_id" class="form-field" required @change="updateStudentName">
            <option value="" disabled>Select a student</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label" for="subject">Subject</label>
          <select id="subject" v-model="form.subject_id" class="form-field" required @change="updateSubjectTitle">
            <option value="" disabled>Select a subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.title }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Enrolling…" : "Enroll student" }}
          </button>
          <router-link class="btn btn-ghost" to="/teacher/enrollments">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";

export default {
  name: "EnrollmentForm",
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
      saving: false,
      error: "",
      notice: "",
    };
  },
  created() {
    this.fetchStudents();
    this.fetchSubjects();
  },
  methods: {
    async fetchStudents() {
      try {
        const response = await axios.get("/teacher/getStudents");
        this.students = response.data;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load the student list.",
        );
      }
    },
    async fetchSubjects() {
      try {
        const response = await axios.get("/teacher/getSubjects");
        this.subjects = response.data;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load the subject list.",
        );
      }
    },
    updateStudentName() {
      const selected = this.students.find(
        (student) => student.id === this.form.student_id,
      );
      this.student_name = selected ? selected.name : "";
    },
    updateSubjectTitle() {
      const selected = this.subjects.find(
        (subject) => subject.id === this.form.subject_id,
      );
      this.subject_title = selected ? selected.title : "";
    },
    async createEnrollment() {
    // Both selects are `required`, so this only catches a stale value after
    // the lists reloaded underneath the form.
      if (!this.student_name || !this.subject_title) {
        this.error = "Please choose both a student and a subject.";
        return;
      }

      this.saving = true;
      this.error = "";
      this.notice = "";
      try {
        const response = await axios.post("/teacher/enrollments", {
          student_name: this.student_name,
          subject_name: this.subject_title,
        });
        this.notice = `${this.student_name} is now enrolled in ${this.subject_title}.`;
        this.form.student_id = "";
        this.form.subject_id = "";
        this.student_name = "";
        this.subject_title = "";
        this.$emit("enrollmentCreated", response.data);
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't create that enrollment.",
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
