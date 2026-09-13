<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Timetable</p>
      <h1 class="page__title">Computer lab schedule</h1>
      <p class="page__lead">
        Who has the lab, on which day, and at what time. Students and teachers
        see these entries on their dashboards.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <button
type="button" class="btn btn-primary" :aria-expanded="showForm ? 'true' : 'false'"
          aria-controls="schedule-form" @click="toggleForm">
          {{ showForm ? "Close form" : "Add a schedule" }}
        </button>
      </div>
    </div>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <!-- Two kinds of failure, kept apart on purpose: one means "we have no
         list", the other means "your last action did not go through" and must
         not hide the timetable that is still on screen. -->
    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="reload">
        Try again
      </button>
    </p>

    <p v-if="actionError" class="alert alert-error" role="alert">
      {{ actionError }}
    </p>

    <div
      v-if="showForm"
id="schedule-form" class="card card-pad form-narrow stack"
    >
      <h2 class="section-title">
        {{ isEditing ? "Edit schedule" : "New schedule" }}
      </h2>

      <form class="form" @submit.prevent="saveSchedule">
        <div class="form-grid form-grid--2">
          <div>
            <label class="form-label" for="day">Day</label>
            <select id="day" v-model="form.day" class="form-field" required>
              <option value="" disabled>Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <div>
            <label class="form-label" for="room_name">Room</label>
            <input id="room_name" v-model="form.room" class="form-field" type="text" placeholder="e.g. Computer Lab 1"
              required
/>
          </div>

          <div>
            <label class="form-label" for="time_in">Time in</label>
            <input id="time_in" v-model="form.time_in"
class="form-field"
type="time"
required />
          </div>

          <div>
            <label class="form-label" for="time_out">Time out</label>
            <input id="time_out" v-model="form.time_out"
class="form-field"
type="time"
required />
          </div>
        </div>

        <div>
          <label class="form-label" for="teacher">Teacher</label>
          <select id="teacher" v-model="form.teacher_id"
class="form-field" required>
            <option value="" disabled>Select a teacher</option>
            <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
              {{ teacher.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{
              saving ? "Saving…" : isEditing ? "Save changes" : "Add schedule"
            }}
          </button>
          <button type="button" class="btn btn-ghost" @click="toggleForm">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <p v-if="loading" class="sr-only" role="status">Loading schedules…</p>

    <PanelCard v-else-if="!loadError" title="Scheduled sessions" :empty="!schedules.length"
      empty-title="Nothing scheduled yet" empty-text="Add a schedule to reserve the computer lab for a class.">
      <ul class="record-list">
        <li v-for="schedule in schedules" :key="schedule.id" class="record">
          <div>
            <h3 class="record__title">{{ schedule.day }}</h3>
            <p class="record__facts">
              <span class="record__fact">
                <span class="record__fact-label">Time</span>
                {{ schedule.time_in }}–{{ schedule.time_out }}
              </span>
              <span class="record__fact">
                <span class="record__fact-label">Room</span>
                {{ schedule.room }}
              </span>
              <span class="record__fact">
                <span class="record__fact-label">Teacher</span>
                {{ teacherName(schedule) }}
              </span>
            </p>
          </div>
          <div class="record__actions">
            <button
type="button" class="action-link"
              @click="editSchedule(schedule)"
            >
              Edit
            </button>
            <button
type="button" class="action-link action-link--danger" @click="askDelete(schedule)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </PanelCard>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this schedule?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

/** The empty shape, reused by the reset paths so they cannot drift apart. */
const blankForm = () => ({
  day: "",
  time_in: "",
  time_out: "",
  room: "",
  teacher_id: "",
});

export default {
  name: "ScheduleManager",
  components: { PanelCard, ModalPopup },
  setup() {
    const schedules = ref([]);
    const teachers = ref([]);
    const form = ref(blankForm());
    const isEditing = ref(false);
    const currentScheduleId = ref(null);
    const loading = ref(true);
    const saving = ref(false);
    // A message rather than a flag: the API's own wording is more specific
    // than "Error loading schedules".  `loadError` means the page has no list
    // to show; `actionError` means a save or delete was rejected while the
    // list on screen is still valid.
    const loadError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const showForm = ref(false);
    const showModal = ref(false);
    const scheduleToDelete = ref(null);

    const fetchSchedules = async () => {
      loading.value = true;
      loadError.value = "";
      try {
        const response = await axios.get("/admin/schedules");
        schedules.value = response.data;
      } catch (err) {
        loadError.value = apiErrorMessage(
          err,
          "We couldn't load the schedule.",
        );
      } finally {
        loading.value = false;
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/admin/teachers");
        teachers.value = response.data.teachers;
      } catch (err) {
        // Only worth reporting if the schedule itself loaded: this list feeds
        // one dropdown, and a page that already has its rows should still show
        // them.
        if (!loadError.value) {
          loadError.value = apiErrorMessage(
            err,
            "We couldn't load the teacher list.",
          );
        }
      }
    };

    /** Retry for the failed-load alert: both requests, in the mount order. */
    const reload = async () => {
      await fetchSchedules();
      await fetchTeachers();
    };

    const saveSchedule = async () => {
      const url = isEditing.value
        ? `/admin/schedules/${currentScheduleId.value}`
        : "/admin/schedules";
      const method = isEditing.value ? "put" : "post";

      saving.value = true;
      actionError.value = "";
      notice.value = "";
      try {
        await axios[method](url, form.value);
        const wasEditing = isEditing.value;
        form.value = blankForm();
        isEditing.value = false;
        currentScheduleId.value = null;
        showForm.value = false;
        await fetchSchedules();
        notice.value = wasEditing ? "Schedule updated." : "Schedule added.";
      } catch (err) {
        actionError.value = apiErrorMessage(
          err,
          "We couldn't save this schedule. Please try again.",
        );
      } finally {
        saving.value = false;
      }
    };

    const editSchedule = (schedule) => {
      // `teacher_id` is what the form submits; the record carries a nested
      // `teacher` object instead, so it is mapped explicitly rather than
      // spread wholesale.
      form.value = {
        day: schedule.day,
        time_in: schedule.time_in,
        time_out: schedule.time_out,
        room: schedule.room,
        teacher_id: schedule.teacher_id,
      };
      isEditing.value = true;
      currentScheduleId.value = schedule.id;
      showForm.value = true;
      notice.value = "";
    };

    const askDelete = (schedule) => {
      scheduleToDelete.value = schedule;
      showModal.value = true;
    };

    const cancelDelete = () => {
      showModal.value = false;
      scheduleToDelete.value = null;
    };

    const confirmDelete = async () => {
      const schedule = scheduleToDelete.value;
      showModal.value = false;
      scheduleToDelete.value = null;
      if (!schedule) return;
      notice.value = "";
      actionError.value = "";
      try {
        await axios.delete(`/admin/schedules/${schedule.id}`);
        schedules.value = schedules.value.filter((s) => s.id !== schedule.id);
        notice.value = "Schedule deleted.";
      } catch (err) {
        actionError.value = apiErrorMessage(
          err,
          "We couldn't delete that schedule.",
        );
      }
    };

    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        isEditing.value = false;
        currentScheduleId.value = null;
        form.value = blankForm();
      }
    };

    /** A schedule whose teacher row is gone still renders, without a crash. */
    const teacherName = (schedule) =>
      schedule.teacher ? schedule.teacher.name : "Unassigned";

    onMounted(async () => {
      await fetchSchedules();
      await fetchTeachers();
    });

    return {
      schedules,
      teachers,
      form,
      isEditing,
      saveSchedule,
      editSchedule,
      loading,
      saving,
      loadError,
      actionError,
      notice,
      showForm,
      toggleForm,
      showModal,
      scheduleToDelete,
      askDelete,
      cancelDelete,
      confirmDelete,
      teacherName,
      reload,
    };
  },
  computed: {
    deleteMessage() {
      const s = this.scheduleToDelete;
      if (!s) return "This cannot be undone.";
      return `${s.day} ${s.time_in}–${s.time_out} in ${s.room} will be removed from the timetable. This cannot be undone.`;
    },
  },
};
</script>
