<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Edit TODO</h1>
      <p class="page__lead">
        Students see these changes the next time they open their Tasks page.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <div v-if="loading" class="form" aria-hidden="true">
        <span class="skeleton form__skeleton"></span>
        <span class="skeleton form__skeleton form__skeleton--tall"></span>
        <p class="sr-only" role="status">Loading TODO…</p>
      </div>

      <form v-else class="form" @submit.prevent="updateTodo">
        <div class="form-grid form-grid--2">
          <div>
            <label class="form-label" for="subject">Subject</label>
            <select id="subject" v-model="todo.subject" class="form-field" required>
              <option value="" disabled>Select a subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="form-label" for="type">Type</label>
            <select id="type" v-model="todo.type" class="form-field">
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label" for="title">Title</label>
          <input id="title" v-model="todo.title" class="form-field" type="text" required />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea id="description" v-model="todo.description" class="form-field" rows="5"></textarea>
        </div>

        <div>
          <label class="form-label" for="attachment">Replace attachment</label>
          <input id="attachment" class="form-field" type="file" aria-describedby="attachment-status"
            @change="handleFileUpload" />
          <p id="attachment-status" class="form-help" :class="{ 'form-error': uploadError }" role="status">
            <template v-if="uploading">Uploading…</template>
            <template v-else-if="uploadError">{{ uploadError }}</template>
            <template v-else-if="todo.fileUrl">
              New file ready — it replaces the current attachment when you save.
            </template>
            <template v-else-if="existingFileUrl">
              Current attachment:
              <a :href="existingFileUrl" class="action-link" target="_blank" rel="noopener">
                open it
              </a>
            </template>
            <template v-else>There is no attachment yet.</template>
          </p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving || uploading">
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
          <router-link class="btn btn-ghost" to="/teacher/todos">
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
import { uploadAttachment } from "@/cloudinary";

export default {
  name: "TodoEdit",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const todo = ref({
      subject: "",
      type: "",
      title: "",
      description: "",
      fileUrl: "",
    });
    const subjects = ref([]);
    /* The attachment already saved on the server, which the form does not
       overwrite unless a new file is chosen. */
    const existingFileUrl = ref("");
    const loading = ref(true);
    const saving = ref(false);
    const uploading = ref(false);
    const error = ref("");
    const uploadError = ref("");

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      uploading.value = true;
      uploadError.value = "";
      try {
        todo.value.fileUrl = await uploadAttachment(file);
      } catch (err) {
        todo.value.fileUrl = "";
        uploadError.value =
          "We couldn't upload that file. The existing attachment is unchanged.";
      } finally {
        uploading.value = false;
      }
    };

    const updateTodo = async () => {
      saving.value = true;
      error.value = "";
      try {
        const formData = new FormData();
        formData.append("subject_id", todo.value.subject);
        formData.append("type", todo.value.type);
        formData.append("title", todo.value.title);
        formData.append("description", todo.value.description);
        if (todo.value.fileUrl) {
          formData.append("fileUrl", todo.value.fileUrl);
        }
        await axios.put(`/teacher/todos/${route.params.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        router.push("/teacher/todos");
      } catch (err) {
        error.value = apiErrorMessage(
          err,
          "We couldn't save your changes. Please try again.",
        );
      } finally {
        saving.value = false;
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/teacher/getSubjects");
        subjects.value = response.data;
      } catch (err) {
        error.value = apiErrorMessage(
          err,
          "We couldn't load your subjects, so the subject list is empty.",
        );
      }
    };

    const fetchTodo = async () => {
      try {
        const response = await axios.get(`/teacher/todos/${route.params.id}`);
        const data = response.data;
        /* The form's `fileUrl` starts empty on purpose: it doubles as "a new
           file was chosen", and the API only replaces the attachment when it
           is present. The current attachment is shown from the loaded value. */
        todo.value = {
          subject: data.subject_id,
          type: data.type,
          title: data.title,
          description: data.description,
          fileUrl: "",
        };
        existingFileUrl.value = data.fileUrl || "";
      } catch (err) {
        error.value = apiErrorMessage(err, "We couldn't load this TODO.");
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await Promise.all([fetchSubjects(), fetchTodo()]);
    });

    return {
      todo,
      subjects,
      existingFileUrl,
      loading,
      saving,
      uploading,
      error,
      uploadError,
      handleFileUpload,
      updateTodo,
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
  height: 5rem;
}

input[type="file"].form-field {
  padding: var(--space-2) var(--space-3);
}
</style>
