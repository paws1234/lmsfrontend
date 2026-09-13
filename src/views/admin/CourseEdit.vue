<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Catalogue</p>
      <h1 class="page__title">Edit course</h1>
      <p class="page__lead">
        Changes apply to every student already enrolled in this course.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <!-- The form is only meaningful once the record has arrived, so the
           skeleton stands in for it rather than showing empty inputs that
           would then fill in underneath the user. -->
      <div v-if="loading" class="form" aria-hidden="true">
        <span class="skeleton form__skeleton"></span>
        <span class="skeleton form__skeleton form__skeleton--tall"></span>
        <p class="sr-only" role="status">Loading course…</p>
      </div>

      <form v-else class="form" @submit.prevent="updateCourse">
        <div>
          <label class="form-label" for="title">Title</label>
          <input
            id="title"
            v-model="course.title"
class="form-field"
            type="text"
placeholder="Course title"
            autocomplete="off" required
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
            {{ saving ? "Saving…" : "Save changes" }}
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
  name: "CourseEdit",
  data() {
    return {
      course: {
        title: "",
        description: "",
      },
      // Starts true: the record has to be fetched before the fields mean
      // anything.
      loading: true,
      saving: false,
      error: "",
    };
  },
  created() {
    this.fetchCourse();
  },
  methods: {
    async fetchCourse() {
      this.loading = true;
      this.error = "";
      try {
        const response = await axios.get(
          `/admin/courses/${this.$route.params.id}`,
        );
        this.course = response.data;
      } catch (error) {
        this.error = apiErrorMessage(error, "We couldn't load this course.");
      } finally {
        this.loading = false;
      }
    },
    async updateCourse() {
      this.saving = true;
      this.error = "";
      try {
        await axios.put(`/admin/courses/${this.$route.params.id}`, this.course);
        this.$router.push("/admin/courses");
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't save your changes. Please try again.",
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
/* The loading skeleton stands in for the two fields, so it has to occupy
   roughly the same space or the card jumps when the data lands. */
.form__skeleton {
  display: block;
  height: 2.75rem;
}
.form__skeleton--tall {
  height: 8rem;
}
</style>
