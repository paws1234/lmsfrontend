<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">People</p>
      <h1 class="page__title">Edit teacher</h1>
      <p class="page__lead">
        Update this teacher's name, email address or password.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <div v-if="loading" class="form" aria-hidden="true">
        <span class="skeleton form__skeleton"></span>
        <span class="skeleton form__skeleton"></span>
        <p class="sr-only" role="status">Loading teacher…</p>
      </div>

      <form v-else class="form" @submit.prevent="submitForm">
        <div>
          <label class="form-label" for="name">Full name</label>
          <input id="name" v-model="teacher.name"
class="form-field"
type="text"
autocomplete="name" required />
        </div>

        <div>
          <label class="form-label" for="email">Email address</label>
          <input id="email" v-model="teacher.email"
class="form-field"
type="email"
autocomplete="email" required />
        </div>

        <div>
          <label class="form-label" for="password">Password</label>
          <input id="password" v-model="teacher.password"
class="form-field"
type="password"
            placeholder="Leave blank to keep the current password" autocomplete="off"
            aria-describedby="password-help" />
          <p id="password-help" class="form-help">
            Only fill this in if you want to set a new password.
          </p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
          <router-link class="btn btn-ghost" to="/admin/teachers">
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
  name: "TeacherUpdate",
  data() {
    return {
      teacher: {
        name: "",
        email: "",
        password: "",
      },
      loading: true,
      saving: false,
      error: "",
    };
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const response = await axios.get(`/admin/teachers/${id}`);
      this.teacher = { ...response.data, password: "" };
    } catch (error) {
      this.error = apiErrorMessage(
        error,
        "We couldn't load this teacher's details.",
      );
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async submitForm() {
      this.saving = true;
      this.error = "";
      try {
        await axios.put(
          `/admin/teachers/${this.$route.params.id}`,
          this.teacher,
        );
        this.$router.push("/admin/teachers");
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
/* Matches the height of a label + field so the card does not jump when the
   real values replace the skeleton. */
.form__skeleton {
  display: block;
  height: 2.75rem;
}
</style>
