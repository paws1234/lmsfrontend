<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Edit subject</h1>
      <p class="page__lead">
        Changes are visible to every student enrolled in this subject.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <div v-if="loading" class="form" aria-hidden="true">
        <span class="skeleton form__skeleton"></span>
        <span class="skeleton form__skeleton form__skeleton--tall"></span>
        <p class="sr-only" role="status">Loading subject…</p>
      </div>

      <form v-else class="form" @submit.prevent="updateSubject">
        <div>
          <label class="form-label" for="title">Title</label>
          <input id="title" v-model="form.title"
class="form-field"
type="text"
autocomplete="off" required />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea id="description" v-model="form.description"
class="form-field" rows="4"></textarea>
        </div>

        <div>
          <label class="form-label" for="schedule">Schedule</label>
          <input id="schedule" v-model="form.schedule"
class="form-field"
type="text"
placeholder="e.g. 8 AM - 10 AM"
            required />
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
          <router-link class="btn btn-ghost" to="/teacher/subjects">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiErrorMessage } from "@/apiError";

export default {
  name: "SubjectEdit",
  setup() {
    const form = ref({
      title: "",
      description: "",
      schedule: "",
    });
    const route = useRoute();
    const router = useRouter();
    const subjectId = route.params.id;
    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");

    const fetchSubject = async () => {
      loading.value = true;
      error.value = "";
      try {
        const response = await axios.get(`/teacher/subjects/${subjectId}`);
        form.value = response.data;
      } catch (err) {
        error.value = apiErrorMessage(err, "We couldn't load this subject.");
      } finally {
        loading.value = false;
      }
    };

    const updateSubject = async () => {
      saving.value = true;
      error.value = "";
      try {
        await axios.put(`/teacher/subjects/${subjectId}`, form.value);
        router.push("/teacher/subjects");
      } catch (err) {
        error.value = apiErrorMessage(
          err,
          "We couldn't save your changes. Please try again.",
        );
      } finally {
        saving.value = false;
      }
    };

    onMounted(fetchSubject);

    return {
      form,
      loading,
      saving,
      error,
      updateSubject,
    };
  },
};
</script>

<style scoped>
.form__skeleton {
  display: block;
  height: 2.75rem;
}

.form__skeleton--tall {
  height: 6rem;
}
</style>
