<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">
      Computer Lab Schedule
    </h1>
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center space-y-4 mb-6"
    >
      <div class="loader"></div>
      <p class="text-blue-600 text-lg font-medium">Loading schedules...</p>
    </div>

    <p v-if="error" class="text-red-600 text-lg font-medium text-center mb-6">
      Error loading schedules. Please try again later.
    </p>
    <button
      @click="toggleForm"
      class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 mb-6"
    >
      {{ showForm ? "Hide Form" : "Add New Schedule" }}
    </button>
    <form
      v-if="showForm"
      @submit.prevent="saveSchedule"
      class="bg-white p-8 rounded-lg shadow-md mb-6"
    >
      <h2 class="text-xl font-semibold mb-4 text-gray-800">
        {{ isEditing ? "Edit Schedule" : "Add New Schedule" }}
      </h2>
      <div class="mb-6">
        <label for="day" class="block text-gray-700 text-lg font-medium">Day</label>
        <select
          v-model="form.day"
          id="day"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        >
          <option value="" disabled>Select a day</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
        </select>
      </div>
      <div class="mb-6">
        <label for="time_in" class="block text-gray-700 text-lg font-medium">Time In</label>
        <input
          v-model="form.time_in"
          type="time"
          id="time_in"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label for="time_out" class="block text-gray-700 text-lg font-medium">Time Out</label>
        <input
          v-model="form.time_out"
          type="time"
          id="time_out"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label for="room_name" class="block text-gray-700 text-lg font-medium">Room</label>
        <input
          v-model="form.room"
          type="text"
          id="room_name"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label for="teacher" class="block text-gray-700 text-lg font-medium">Teacher</label>
        <select
          v-model="form.teacher_id"
          id="teacher"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        >
          <option value="" disabled>Select a teacher</option>
          <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
            {{ teacher.name }}
          </option>
        </select>

      </div>
      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
      >
        {{ isEditing ? "Update Schedule" : "Add Schedule" }}
      </button>
    </form>
    <div v-if="schedules.length" class="bg-white p-6 rounded-lg shadow-md">
      <ul class="space-y-4">
        <li
          v-for="schedule in schedules"
          :key="schedule.id"
          class="p-4 border-b border-gray-200 flex items-start justify-between"
        >
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-800">
              {{ schedule.day }}
            </h2>
            <p class="text-gray-600">
              Time: {{ schedule.time_in }} - {{ schedule.time_out }}
            </p>
            <p class="text-gray-600 mt-2">Room: {{ schedule.room }}<br /></p>
            <p class="text-gray-600 mt-2">
              Teacher: {{ schedule.teacher.name }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 space-x-4">
            <button
              @click="editSchedule(schedule)"
              class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              Edit
            </button>
            <button
              @click="deleteSchedule(schedule.id)"
              class="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>
    <p
      v-if="!schedules.length && !loading && !error"
      class="text-gray-600 text-lg font-medium text-center"
    >
      No schedules found.
    </p>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";

export default {
  name: "ScheduleManager",
  setup() {
    const schedules = ref([]);
    const teachers = ref([]); // Define teachers here
    const form = ref({
      day: "",
      time_in: "",
      time_out: "",
      room: "",
      teacher_id: "",
    });
    const isEditing = ref(false);
    const currentScheduleId = ref(null);
    const loading = ref(true);
    const error = ref(false);
    const showForm = ref(false);

    const fetchSchedules = async () => {
      loading.value = true;
      error.value = false;
      try {
        const response = await axios.get("/admin/schedules");
        schedules.value = response.data;
      } catch (err) {
        console.error("Error fetching schedules:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/admin/teachers");
        teachers.value = response.data.teachers; // Update this line to access teachers from the response
        console.log("Teachers fetched:", teachers.value);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        error.value = true;
      }
    };

    const saveSchedule = async () => {
      const url = isEditing.value
        ? `/admin/schedules/${currentScheduleId.value}`
        : "/admin/schedules";
      const method = isEditing.value ? "put" : "post";

      try {
        await axios[method](url, form.value);
        form.value = {
          day: "",
          time_in: "",
          time_out: "",
          room: "",
          teacher_id: "",
        };
        isEditing.value = false;
        currentScheduleId.value = null;
        showForm.value = false;
        await fetchSchedules();
      } catch (err) {
        console.error("Error saving schedule:", err);
        error.value = true;
      }
    };

    const editSchedule = (schedule) => {
      form.value = { ...schedule };
      isEditing.value = true;
      currentScheduleId.value = schedule.id;
      showForm.value = true;
    };

    const deleteSchedule = async (id) => {
      if (confirm("Are you sure you want to delete this schedule?")) {
        try {
          await axios.delete(`/admin/schedules/${id}`);
          await fetchSchedules();
        } catch (err) {
          console.error("Error deleting schedule:", err);
          error.value = true;
        }
      }
    };

    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        isEditing.value = false;
        form.value = {
          day: "",
          time_in: "",
          time_out: "",
          room: "",
          teacher_id: "",
        };
      }
    };

    onMounted(async () => {
      await fetchSchedules();
      await fetchTeachers();
    });

    return {
      schedules,
      teachers, // Return teachers to be used in the template
      form,
      isEditing,
      saveSchedule,
      editSchedule,
      deleteSchedule,
      loading,
      error,
      showForm,
      toggleForm,
    };
  },
};
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: transparent;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
