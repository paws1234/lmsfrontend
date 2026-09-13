<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">New TODO</h1>
      <p class="page__lead">
        A TODO is work set for every student in a subject. They see it under
        Tasks, together with any attachment.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <div class="card card-pad form-narrow">
      <form class="form" @submit.prevent="createTodo">
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
          <input id="title" v-model="todo.title" class="form-field" type="text" placeholder="What the task is"
            required />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea id="description" v-model="todo.description" class="form-field" rows="5"
            placeholder="Instructions for the students"></textarea>
        </div>

        <div>
          <label class="form-label" for="attachment">Attachment (optional)</label>
          <input id="attachment" class="form-field" type="file" aria-describedby="attachment-status"
            @change="handleFileUpload" />
          <!-- Announced rather than silent: an upload that failed used to
               leave the user believing a file was attached. -->
          <p id="attachment-status" class="form-help" :class="{ 'form-error': uploadError }" role="status">
            <template v-if="uploading">Uploading…</template>
            <template v-else-if="uploadError">{{ uploadError }}</template>
            <template v-else-if="todo.fileUrl">Attached — it will be saved with this TODO.</template>
            <template v-else>Images, video, PDF and text files are supported.</template>
          </p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving || uploading">
            {{ saving ? "Saving…" : "Save TODO" }}
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiErrorMessage } from "@/apiError";
import { uploadAttachment } from "@/cloudinary";

export default {
  name: "TodoCreate",
  setup() {
    const router = useRouter();
    const todo = ref({
      subject: "",
      type: "personal",
      title: "",
      description: "",
      fileUrl: "",
    });
    const subjects = ref([]);
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
        // The form stays usable: the TODO can still be saved without the file.
        todo.value.fileUrl = "";
        uploadError.value =
          "We couldn't upload that file. You can still save the TODO without it.";
      } finally {
        uploading.value = false;
      }
    };

    const createTodo = async () => {
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
        await axios.post("/teacher/todos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        router.push("/teacher/todos");
      } catch (err) {
        error.value = apiErrorMessage(
          err,
          "We couldn't save this TODO. Please try again.",
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

    fetchSubjects();

    return {
      todo,
      subjects,
      saving,
      uploading,
      error,
      uploadError,
      handleFileUpload,
      createTodo,
    };
  },
};
</script>
<style scoped>
/* A native file input is drawn by the browser, so only the padding and radius
   are ours; `.form-field` already pins its colours for both themes. */
input[type="file"].form-field {
  padding: var(--space-2) var(--space-3);
}
</style>
