<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">TODO List</h1>
      <p class="page__lead">
        Tasks set for your subjects, with their attachments. Students see the
        same entries under Tasks.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <label class="sr-only" for="todo-search">Search TODOs</label>
        <input id="todo-search" v-model="searchQuery" class="form-field search" type="search"
          placeholder="Search by title or description" />
      </div>
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/teacher/todos/create">
          Add New TODO
        </router-link>
        <router-link class="btn btn-ghost" to="/teacher/questions/create">
          Create CTU FORMS
        </router-link>
        <router-link class="btn btn-ghost" to="/teacher/questions/list">
          View Questions
        </router-link>
      </div>
    </div>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchTodos">
        Try again
      </button>
    </p>

    <p v-if="actionError" class="alert alert-error" role="alert">
      {{ actionError }}
    </p>

    <PanelCard v-if="!loadError" title="All TODOs" :loading="loading" :empty="!filteredTodos.length"
      :empty-title="hasTodos ? 'No TODOs match your search' : 'No TODOs yet'" :empty-text="hasTodos
          ? 'Try a different word, or clear the search box.'
          : 'Add a TODO to give your students work to do.'
        ">
      <div class="table-wrap">
        <table class="table todo-table">
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Subject</th>
              <th scope="col">Attachment</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="todo in filteredTodos" :key="todo.id">
              <td>
                <span class="badge">{{ todo.type }}</span>
              </td>
              <td>
                <span class="todo-table__title">{{ todo.title }}</span>
              </td>
              <td>{{ todo.description }}</td>
              <td>{{ todo.subject_name || "No subject" }}</td>
              <td>
                <a v-if="todo.file" :href="todo.file" class="action-link" download>
                  Download
                </a>
                <span v-else class="todo-table__none">None</span>
              </td>
              <td>
                <router-link :to="{ name: 'TodoEdit', params: { id: todo.id } }" class="action-link">
                  Edit
                </router-link>
                <button type="button" class="action-link action-link--danger" @click="askDelete(todo)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this TODO?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

export default {
  name: "TodoList",
  components: { PanelCard, ModalPopup },
  setup() {
    const todos = ref([]);
    const searchQuery = ref("");
    const loading = ref(true);
    const loadError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const showModal = ref(false);
    const todoToDelete = ref(null);

    const fetchTodos = async () => {
      loading.value = true;
      loadError.value = "";
      try {
        const response = await axios.get("/teacher/todos");
        todos.value = response.data;
      } catch (error) {
        loadError.value = apiErrorMessage(
          error,
          "We couldn't load your TODOs.",
        );
      } finally {
        loading.value = false;
      }
    };

    const askDelete = (todo) => {
      todoToDelete.value = todo;
      showModal.value = true;
    };

    const cancelDelete = () => {
      showModal.value = false;
      todoToDelete.value = null;
    };

    const confirmDelete = async () => {
      const todo = todoToDelete.value;
      showModal.value = false;
      todoToDelete.value = null;
      if (!todo) return;
      notice.value = "";
      actionError.value = "";
      try {
        await axios.delete(`/teacher/todos/${todo.id}`);
        todos.value = todos.value.filter((t) => t.id !== todo.id);
        notice.value = `“${todo.title}” was deleted.`;
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't delete that TODO.",
        );
      }
    };

    /* Filtered on trimmed, lower-cased text; a TODO with no description used
       to throw inside this computed and blank the whole table. */
    const filteredTodos = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query) return todos.value;
      return todos.value.filter((todo) =>
        [todo.title, todo.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    });

    const hasTodos = computed(() => todos.value.length > 0);

    onMounted(fetchTodos);

    return {
      todos,
      searchQuery,
      loading,
      loadError,
      actionError,
      notice,
      showModal,
      todoToDelete,
      askDelete,
      cancelDelete,
      confirmDelete,
      filteredTodos,
      hasTodos,
      fetchTodos,
    };
  },
  computed: {
    deleteMessage() {
      const t = this.todoToDelete;
      if (!t) return "This cannot be undone.";
      return `“${t.title}” will be removed for every student in that subject. This cannot be undone.`;
    },
  },
};
</script>

<style scoped>
.todo-table {
  min-width: 52rem;
}

.todo-table__title {
  font-weight: 600;
  color: var(--text);
}

.todo-table__none {
  color: var(--text-muted);
}
</style>
