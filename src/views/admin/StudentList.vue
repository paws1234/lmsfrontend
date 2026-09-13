<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">People</p>
      <h1 class="page__title">Students</h1>
      <p class="page__lead">
        Accounts with access to the student portal. A student appears here as
        soon as they register or as soon as you add them.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/admin/students/create">
          New student
        </router-link>
      </div>
    </div>

    <p v-if="loading" class="sr-only" role="status">Loading students…</p>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="error" class="alert alert-error" role="alert">
      {{ error }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchStudents"
      >
        Try again
      </button>
    </p>

    <PanelCard v-else title="All students" :loading="loading" :empty="!students.length" empty-title="No students yet"
      empty-text="Students appear here once they register or are added by an administrator.">
      <ul class="record-list">
        <li v-for="student in students" :key="student.id" class="record">
          <div>
            <h3 class="record__title">{{ student.name }}</h3>
            <p class="record__meta">{{ student.email }}</p>
          </div>
          <div class="record__actions">
            <router-link
              :to="`/admin/students/${student.id}`"
class="action-link"
            >
              Edit
            </router-link>
            <button
type="button" class="action-link action-link--danger" @click="openDeleteModal(student)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </PanelCard>

    <ModalPopup
      :is-visible="showModal"
tone="danger" title="Delete this student?" confirm-label="Delete"
      :message="deleteMessage"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import ModalPopup from "@/views/ModalPopup.vue";
import PanelCard from "@/components/PanelCard.vue";

export default {
  name: "AdminStudentList",
  components: {
    ModalPopup,
    PanelCard,
  },
  data() {
    return {
      students: [],
      loading: true,
      error: "",
      notice: "",
      showModal: false,
      studentToDelete: null,
    };
  },
  computed: {
    deleteMessage() {
      const name = this.studentToDelete ? this.studentToDelete.name : "";
      return `${name} and their enrolments will be removed. This cannot be undone.`;
    },
  },
  mounted() {
    this.fetchStudents();
  },
  methods: {
    async fetchStudents() {
      this.loading = true;
      this.error = "";
      try {
        const response = await axios.get("/admin/students");
        this.students = response.data.students;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load the student list.",
        );
      } finally {
        this.loading = false;
      }
    },

    openDeleteModal(student) {
      this.studentToDelete = student;
      this.showModal = true;
    },

    handleCancelDelete() {
      this.showModal = false;
      this.studentToDelete = null;
    },

    async handleConfirmDelete() {
      const student = this.studentToDelete;
      this.showModal = false;
      this.studentToDelete = null;
      if (!student) return;
      this.notice = "";
      this.error = "";
      try {
        await axios.delete(`/admin/students/${student.id}`);
        this.students = this.students.filter((item) => item.id !== student.id);
        this.notice = `${student.name} was deleted.`;
      } catch (error) {
        this.error = apiErrorMessage(error, "We couldn't delete that student.");
      }
    },
  },
};
</script>

