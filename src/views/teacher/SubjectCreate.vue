<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">New subject</h1>
      <p class="page__lead">
        A subject is what students are enrolled in. Its schedule is shown to
        those students on their dashboard.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <form class="form" @submit.prevent="createSubject">
        <div>
          <label class="form-label" for="title">Title</label>
          <input id="title" v-model="form.title"
class="form-field"
type="text"
            placeholder="e.g. Web Systems and Technologies" autocomplete="off" required />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea id="description" v-model="form.description"
class="form-field" rows="4"
            placeholder="What the subject covers"></textarea>
        </div>

        <div>
          <label class="form-label" for="schedule">Schedule</label>
          <input id="schedule" v-model="form.schedule"
class="form-field"
type="text"
placeholder="e.g. 8 AM - 10 AM"
            aria-describedby="schedule-help" required />
          <p id="schedule-help" class="form-help">
            Free text, shown exactly as typed — for example "MWF 8 AM - 10 AM".
          </p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Saving…" : "Save subject" }}
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiErrorMessage } from "@/apiError";

export default {
  name: "SubjectCreate",
  setup() {
    const form = ref({
      title: "",
      description: "",
      schedule: "",
    });
    const saving = ref(false);
    const error = ref("");
    const router = useRouter();

    const createSubject = async () => {
      saving.value = true;
      error.value = "";
      try {
        await axios.post("/teacher/subjects", form.value);
        router.push("/teacher/subjects");
      } catch (err) {
        error.value = apiErrorMessage(
          err,
          "We couldn't save this subject. Please try again.",
        );
      } finally {
        saving.value = false;
      }
    };

    return {
      form,
      saving,
      error,
      createSubject,
    };
  },
};
</script>
