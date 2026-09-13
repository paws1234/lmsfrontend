<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">People</p>
      <h1 class="page__title">Teachers</h1>
      <p class="page__lead">
        Accounts that can create subjects, tasks and forms for their students.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/admin/teachers/create">
          New teacher
        </router-link>
      </div>
    </div>

    <p v-if="loading" class="sr-only" role="status">Loading teachers…</p>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="error" class="alert alert-error" role="alert">
      {{ error }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchTeachers">
        Try again
      </button>
    </p>

    <PanelCard v-else title="All teachers" :loading="loading" :empty="!teachers.length" empty-title="No teachers yet"
      empty-text="Add a teacher so subjects and schedules can be assigned to them.">
      <ul class="record-list">
        <li v-for="teacher in teachers" :key="teacher.id" class="record">
          <div>
            <h3 class="record__title">{{ teacher.name }}</h3>
            <p class="record__meta">{{ teacher.email }}</p>
          </div>
          <div class="record__actions">
            <router-link
              :to="`/admin/teachers/${teacher.id}`"
class="action-link"
            >
              Edit
            </router-link>
            <button
type="button" class="action-link action-link--danger" @click="confirmDelete(teacher)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </PanelCard>

    <ModalPopup
      :is-visible="isModalVisible"
tone="danger" title="Delete this teacher?" confirm-label="Delete"
      :message="deleteMessage"
      @confirm="deleteTeacher"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import ModalPopup from "@/views/ModalPopup.vue";
import PanelCard from "@/components/PanelCard.vue";

export default {
  name: "AdminTeacherList",
  components: {
    ModalPopup,
    PanelCard,
  },
  data() {
    return {
      teachers: [],
      loading: true,
      error: "",
      notice: "",
      isModalVisible: false,
      teacherToDelete: null,
    };
  },
  computed: {
    deleteMessage() {
      const name = this.teacherToDelete ? this.teacherToDelete.name : "";
      return `${name} will lose access, and their subjects will be left without a teacher. This cannot be undone.`;
    },
  },
  mounted() {
    this.fetchTeachers();
  },
  methods: {
    async fetchTeachers() {
      this.loading = true;
      this.error = "";
      try {
        const response = await axios.get("/admin/teachers");
        this.teachers = response.data.teachers;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load the teacher list.",
        );
      } finally {
        this.loading = false;
      }
    },

    confirmDelete(teacher) {
      this.teacherToDelete = teacher;
      this.isModalVisible = true;
    },

    cancelDelete() {
      this.isModalVisible = false;
      this.teacherToDelete = null;
    },

    async deleteTeacher() {
      const teacher = this.teacherToDelete;
      this.isModalVisible = false;
      this.teacherToDelete = null;
      if (!teacher) return;
      this.notice = "";
      this.error = "";
      try {
        await axios.delete(`/admin/teachers/${teacher.id}`);
        this.teachers = this.teachers.filter((item) => item.id !== teacher.id);
        this.notice = `${teacher.name} was deleted.`;
      } catch (error) {
        this.error = apiErrorMessage(error, "We couldn't delete that teacher.");
      }
    },
  },
};
</script>

