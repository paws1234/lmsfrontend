<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Subjects</h1>
      <p class="page__lead">
        The subjects you handle, with their schedule. Students enrolled in a
        subject see its tasks and questions.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <label class="sr-only" for="subject-search">Search subjects</label>
        <input
id="subject-search"
v-model="searchQuery"
class="form-field search" type="search"
          placeholder="Search by title, description or schedule" />
      </div>
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/teacher/subjects/create">
          New subject
        </router-link>
      </div>
    </div>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchSubjects"
      >
        Try again
      </button>
    </p>

    <p v-if="actionError" class="alert alert-error" role="alert">
      {{ actionError }}
    </p>

    <PanelCard v-if="!loadError" title="Your subjects" :loading="loading" :empty="!filteredSubjects.length"
      :empty-title="hasSubjects ? 'No subjects match your search' : 'No subjects yet'
        " :empty-text="hasSubjects
          ? 'Try a different word, or clear the search box.'
          : 'Create a subject, then enrol students into it.'
        ">
      <div class="table-wrap">
        <table class="table subject-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Schedule</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in filteredSubjects" :key="subject.id">
              <td>
                <span class="subject-table__title">{{ subject.title }}</span>
              </td>
              <td>{{ subject.description || "—" }}</td>
              <td>
                <span v-if="subject.schedule" class="badge">{{
                  subject.schedule
                  }}</span>
                <span v-else>—</span>
              </td>
              <td>
                <router-link :to="{ name: 'SubjectEdit', params: { id: subject.id } }"
class="action-link">
                  Edit
                </router-link>
                <button
type="button" class="action-link action-link--danger" @click="askDelete(subject)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this subject?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

/** Lower-cased haystack for one subject; a null field must not throw. */
const haystack = (subject) =>
  [subject.title, subject.description, subject.schedule]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default {
  name: "SubjectList",
  components: { PanelCard, ModalPopup },
  setup() {
    const subjects = ref([]);
    const loading = ref(true);
    const searchQuery = ref("");
    const loadError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const showModal = ref(false);
    const subjectToDelete = ref(null);

    const fetchSubjects = async () => {
      loading.value = true;
      loadError.value = "";
      try {
        const response = await axios.get("/teacher/subjects");
        subjects.value = response.data;
      } catch (error) {
        loadError.value = apiErrorMessage(
          error,
          "We couldn't load your subjects.",
        );
      } finally {
        loading.value = false;
      }
    };

    const askDelete = (subject) => {
      subjectToDelete.value = subject;
      showModal.value = true;
    };

    const cancelDelete = () => {
      showModal.value = false;
      subjectToDelete.value = null;
    };

    const confirmDelete = async () => {
      const subject = subjectToDelete.value;
      showModal.value = false;
      subjectToDelete.value = null;
      if (!subject) return;
      notice.value = "";
      actionError.value = "";
      try {
        await axios.delete(`/teacher/subjects/${subject.id}`);
        subjects.value = subjects.value.filter((s) => s.id !== subject.id);
        notice.value = `“${subject.title}” was deleted.`;
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't delete that subject.",
        );
      }
    };

    const filteredSubjects = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query) return subjects.value;
      return subjects.value.filter((subject) =>
        haystack(subject).includes(query),
      );
    });

    const hasSubjects = computed(() => subjects.value.length > 0);

    onMounted(fetchSubjects);

    return {
      subjects,
      loading,
      searchQuery,
      loadError,
      actionError,
      notice,
      showModal,
      subjectToDelete,
      askDelete,
      cancelDelete,
      confirmDelete,
      filteredSubjects,
      hasSubjects,
      fetchSubjects,
    };
  },
  computed: {
    deleteMessage() {
      const s = this.subjectToDelete;
      if (!s) return "This cannot be undone.";
      return `“${s.title}”, its tasks and its questions will be removed. This cannot be undone.`;
    },
  },
};
</script>

<style scoped>
/* Below this the four columns stop being readable, so the wrapper scrolls
   instead of the whole page. */
.subject-table {
  min-width: 40rem;
}

.subject-table__title {
  font-weight: 600;
  color: var(--text);
}
</style>
