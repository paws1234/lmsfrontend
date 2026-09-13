<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Calendar</p>
      <h1 class="page__title">School events</h1>
      <p class="page__lead">
        Events appear on every dashboard, so this is the place to announce
        enrolment periods, examinations and campus activities.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <button type="button" class="btn btn-primary" :aria-expanded="showForm ? 'true' : 'false'"
          aria-controls="event-form" @click="toggleForm">
          {{ showForm ? "Close form" : "Add an event" }}
        </button>
      </div>
    </div>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button
type="button" class="btn btn-ghost alert__action" @click="fetchEventHandlers">
        Try again
      </button>
    </p>

    <p v-if="actionError" class="alert alert-error" role="alert">
      {{ actionError }}
    </p>

    <div
      v-if="showForm"
id="event-form" class="card card-pad form-narrow stack"
    >
      <h2 class="section-title">
        {{ isEditing ? "Edit event" : "New event" }}
      </h2>

      <form class="form" @submit.prevent="saveEventHandler">
        <div>
          <label class="form-label" for="name">Name</label>
          <input id="name" v-model="form.name"
class="form-field"
type="text"
placeholder="e.g. Midterm examinations"
            required />
        </div>

        <div>
          <label class="form-label" for="description">Description</label>
          <textarea id="description" v-model="form.description"
class="form-field"
rows="4"
            placeholder="What students and teachers need to know" required></textarea>
        </div>

        <div>
          <label class="form-label" for="event_date">Date</label>
          <input id="event_date" v-model="form.date"
class="form-field"
type="date"
required />
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? "Saving…" : isEditing ? "Save changes" : "Add event" }}
          </button>
          <button type="button" class="btn btn-ghost" @click="toggleForm">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <p v-if="loading" class="sr-only" role="status">Loading events…</p>

    <PanelCard v-else-if="!loadError" title="All events" :empty="!eventHandlers.length" empty-title="No events yet"
      empty-text="Add the first event and it will appear on every dashboard.">
      <ul class="record-list">
        <li
          v-for="eventHandler in eventHandlers"
          :key="eventHandler.id"
class="record"
        >
          <div>
            <h3 class="record__title">{{ eventHandler.name }}</h3>
            <p v-if="eventHandler.description" class="record__meta">
              {{ eventHandler.description }}
            </p>
          </div>
          <div class="record__actions">
            <time v-if="eventHandler.date" :datetime="eventHandler.date" class="badge">
              {{ formatDate(eventHandler.date) }}
            </time>
            <button
type="button" class="action-link"
              @click="editEventHandler(eventHandler)"
            >
              Edit
            </button>
            <button
type="button" class="action-link action-link--danger" @click="askDelete(eventHandler)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </PanelCard>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this event?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

/* `2026-10-01` — what `<input type="date">` submits.  The same date-only
   handling as `EventList.vue`: `new Date("2026-10-01")` is UTC midnight, so
   west of Greenwich it would print as the 30th. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const blankForm = () => ({ name: "", description: "", date: "" });

export default {
  name: "EventHandlerManager",
  components: { PanelCard, ModalPopup },
  setup() {
    const eventHandlers = ref([]);
    const form = ref(blankForm());
    const isEditing = ref(false);
    const currentEventHandlerId = ref(null);
    const loading = ref(true);
    const saving = ref(false);
    const loadError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const showForm = ref(false);
    const showModal = ref(false);
    const eventToDelete = ref(null);

    const fetchEventHandlers = async () => {
      loading.value = true;
      loadError.value = "";
      try {
        const response = await axios.get("/admin/event-handlers");
        eventHandlers.value = response.data;
      } catch (err) {
        loadError.value = apiErrorMessage(
          err,
          "We couldn't load the school events.",
        );
      } finally {
        loading.value = false;
      }
    };

    const saveEventHandler = async () => {
      const url = isEditing.value
        ? `/admin/event-handlers/${currentEventHandlerId.value}`
        : "/admin/event-handlers";
      const method = isEditing.value ? "put" : "post";

      saving.value = true;
      actionError.value = "";
      notice.value = "";
      try {
        await axios[method](url, form.value);
        const wasEditing = isEditing.value;
        form.value = blankForm();
        isEditing.value = false;
        currentEventHandlerId.value = null;
        showForm.value = false;
        await fetchEventHandlers();
        notice.value = wasEditing ? "Event updated." : "Event added.";
      } catch (err) {
        actionError.value = apiErrorMessage(
          err,
          "We couldn't save this event. Please try again.",
        );
      } finally {
        saving.value = false;
      }
    };

    const editEventHandler = (eventHandler) => {
      // Copied field by field, not spread: the record also carries an `id`
      // that must not be sent back in the body.
      form.value = {
        name: eventHandler.name,
        description: eventHandler.description,
        date: eventHandler.date,
      };
      isEditing.value = true;
      currentEventHandlerId.value = eventHandler.id;
      showForm.value = true;
      notice.value = "";
    };

    const askDelete = (eventHandler) => {
      eventToDelete.value = eventHandler;
      showModal.value = true;
    };

    const cancelDelete = () => {
      showModal.value = false;
      eventToDelete.value = null;
    };

    const confirmDelete = async () => {
      const eventHandler = eventToDelete.value;
      showModal.value = false;
      eventToDelete.value = null;
      if (!eventHandler) return;
      notice.value = "";
      actionError.value = "";
      try {
        await axios.delete(`/admin/event-handlers/${eventHandler.id}`);
        eventHandlers.value = eventHandlers.value.filter(
          (item) => item.id !== eventHandler.id,
        );
        notice.value = `“${eventHandler.name}” was deleted.`;
      } catch (err) {
        actionError.value = apiErrorMessage(
          err,
          "We couldn't delete that event.",
        );
      }
    };

    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        isEditing.value = false;
        currentEventHandlerId.value = null;
        form.value = blankForm();
      }
    };

    /** Unparseable values print verbatim rather than as "Invalid Date". */
    const formatDate = (value) => {
      const date = DATE_ONLY.test(value)
        ? new Date(
          Number(value.slice(0, 4)),
          Number(value.slice(5, 7)) - 1,
          Number(value.slice(8, 10)),
        )
        : new Date(value);
      return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
    };

    onMounted(fetchEventHandlers);

    return {
      eventHandlers,
      form,
      isEditing,
      saveEventHandler,
      editEventHandler,
      loading,
      saving,
      loadError,
      actionError,
      notice,
      showForm,
      toggleForm,
      showModal,
      askDelete,
      cancelDelete,
      confirmDelete,
      formatDate,
      fetchEventHandlers,
      // Read by the `deleteMessage` computed below: a computed cannot see a
      // `setup()` ref that is not returned, and the failure is silent apart
      // from a console warning.
      eventToDelete,
    };
  },
  computed: {
    deleteMessage() {
      const e = this.eventToDelete;
      if (!e) return "This cannot be undone.";
      return `“${e.name}” will be removed from every dashboard. This cannot be undone.`;
    },
  },
};
</script>

