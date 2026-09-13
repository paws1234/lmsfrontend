<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">People</p>
      <h1 class="page__title">
        {{ isEditing ? "Edit teacher" : "Add a teacher" }}
      </h1>
      <p class="page__lead">
        {{
          isEditing
            ? "Update this teacher's details or reset their password."
            : "Creates a teacher account that can run subjects and assessments."
        }}
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <form class="form" @submit.prevent="submitForm">
        <div>
          <label class="form-label" for="name">Full name</label>
          <input
            id="name"
            v-model="name"
class="form-field"
            type="text"
placeholder="e.g. Maria Santos"
            autocomplete="name"
required
          />
        </div>

        <div>
          <label class="form-label" for="email">Email address</label>
          <input
            id="email"
            v-model="email"
class="form-field"
            type="email"
placeholder="teacher@ctu.edu.ph"
            autocomplete="email"
required
          />
          <p class="form-help">
            Used to sign in. It must not already belong to another account.
          </p>
        </div>

        <div>
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
class="form-field"
            type="password"
:placeholder="isEditing
              ? 'Leave blank to keep the current password'
              : 'At least 8 characters'
            " :autocomplete="isEditing ? 'off' : 'new-password'"
            :required="!isEditing"
            aria-describedby="password-help"
          />
          <p id="password-help" class="form-help">
            {{
              isEditing
                ? "Only fill this in if you want to set a new password."
                : "The teacher can change it later from their account."
            }}
          </p>
        </div>

        <div>
          <label class="form-label" for="confirm-password">Confirm password</label
>
          <input
            id="confirm-password"
            v-model="confirmPassword"
class="form-field"
            type="password"
            placeholder="Type the password again" autocomplete="new-password"
            :required="!isEditing"
            :aria-invalid="passwordMismatch ? 'true' : null"
            :aria-describedby="passwordMismatch ? 'confirm-error' : null"
          />
          <p v-if="passwordMismatch" id="confirm-error" class="form-error" role="alert">
            The two passwords do not match.
          </p>
        </div>

        <div class="form-actions">
          <button
class="btn btn-primary"
            type="submit"
:disabled="saving || passwordMismatch"
          >
            {{
              saving ? "Saving…" : isEditing ? "Save changes" : "Create teacher"
            }}
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
  name: "TeacherForm",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isEditing: false,
      saving: false,
      error: "",
    };
  },
  computed: {
    /* Only complains once there is something to compare: an untouched
       "confirm" box next to an empty password is not a mistake yet. */
    passwordMismatch() {
      return (
        this.confirmPassword !== "" && this.password !== this.confirmPassword
      );
    },
  },
  mounted() {
    if (this.$route.params.id) {
      this.isEditing = true;
      this.fetchTeacher(this.$route.params.id);
    }
  },
  methods: {
    async fetchTeacher(id) {
      try {
        const response = await axios.get(`/admin/teachers/${id}`);
        this.name = response.data.name;
        this.email = response.data.email;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load this teacher's details.",
        );
      }
    },
    async submitForm() {
      // The inline message beside the field already explains this, so a modal
      // alert would be a second way of saying the same thing.
      if (this.password !== this.confirmPassword) return;

      this.saving = true;
      this.error = "";
      try {
        const method = this.isEditing ? "put" : "post";
        const url = this.isEditing
          ? `/admin/teachers/${this.$route.params.id}`
          : "/admin/teachers";
        await axios({
          method,
          url,
          data: {
            name: this.name,
            email: this.email,
            password: this.password,
          },
        });
        this.$router.push("/admin/teachers");
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't save this teacher. Please check the details and try again.",
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

