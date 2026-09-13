<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Catalogue</p>
      <h1 class="page__title">Courses</h1>
      <p class="page__lead">
        Every course students can be enrolled in. Edit a course to change its
        title or description.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/admin/courses/create">
          New course
        </router-link>
      </div>
    </div>

    <p v-if="loading" class="sr-only" role="status">Loading courses…</p>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="error" class="alert alert-error" role="alert">
      {{ error }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchCourses">
        Try again
      </button>
    </p>

    <PanelCard v-else title="All courses" :loading="loading" :empty="!courses.length" empty-title="No courses yet"
      empty-text="Courses you create appear here, and can then be assigned to students.">
      <ul class="record-list">
        <li v-for="course in courses" :key="course.id" class="record">
          <div>
            <h3 class="record__title">{{ course.title }}</h3>
            <p v-if="course.description" class="record__meta">
              {{ course.description }}
            </p>
          </div>
          <div class="record__actions">
            <router-link
              :to="`/admin/courses/${course.id}/edit`"
class="action-link"
            >
              Edit
            </router-link>
            <button
type="button" class="action-link action-link--danger" @click="askDelete(course)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </PanelCard>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this course?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

export default {
  name: "CourseList",
  components: { PanelCard, ModalPopup },
  data() {
    return {
      courses: [],
      loading: true,
      // A message, not a boolean: the API's own wording is more useful than
      // "Error loading courses", and a boolean cannot carry it.
      error: "",
      notice: "",
      showModal: false,
      courseToDelete: null,
    };
  },
  computed: {
    deleteMessage() {
      const title = this.courseToDelete ? this.courseToDelete.title : "";
      return `“${title}” and any enrolments in it will be removed. This cannot be undone.`;
    },
  },
  mounted() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      this.loading = true;
      this.error = "";
      try {
        const response = await axios.get("/admin/courses");
        this.courses = response.data.courses;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load the course list.",
        );
      } finally {
        this.loading = false;
      }
    },
    askDelete(course) {
      this.courseToDelete = course;
      this.showModal = true;
    },
    cancelDelete() {
      this.showModal = false;
      this.courseToDelete = null;
    },
    async confirmDelete() {
      const course = this.courseToDelete;
      this.showModal = false;
      this.courseToDelete = null;
      if (!course) return;
      this.notice = "";
      this.error = "";
      try {
        await axios.delete(`/admin/courses/${course.id}`);
        this.courses = this.courses.filter((item) => item.id !== course.id);
        this.notice = `“${course.title}” was deleted.`;
      } catch (error) {
        this.error = apiErrorMessage(error, "We couldn't delete that course.");
      }
    },
  },
};
</script>

