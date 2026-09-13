<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Catalogue</p>
      <h1 class="page__title">Create a course</h1>
      <p class="page__lead">
        A course is what students are enrolled in. Use the name students will
        recognise on their dashboard.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <form class="form" @submit.prevent="createCourse">
        <div>
          <label class="form-label" for="title">Title</label>
          <input
            id="title"
            v-model="course.title"
class="form-field"
            type="text"
            placeholder="e.g. Bachelor of Science in Information Technology" autocomplete="off" required
          />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea
            id="description"
            v-model="course.description"
class="form-field"
            rows="5"
            placeholder="What this course covers"
          ></textarea>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Saving…" : "Save course" }}
          </button>
          <router-link class="btn btn-ghost" to="/admin/courses">
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
  name: "CourseCreate",
  data() {
    return {
      course: {
        title: "",
        description: "",
      },
      saving: false,
      error: "",
    };
  },
  methods: {
    async createCourse() {
      this.saving = true;
      this.error = "";
      try {
        await axios.post("/admin/courses", this.course);
        this.$router.push("/admin/courses");
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't save this course. Please try again.",
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

