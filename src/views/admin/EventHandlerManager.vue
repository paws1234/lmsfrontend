<template>
  <div class="min-h-screen bg-blue-50 p-6">
    <h1 class="text-3xl font-bold text-blue-900 mb-6 text-center">
      School Events
    </h1>
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center space-y-4 mb-6"
    >
      <div class="loader"></div>
      <p class="text-blue-600 text-lg font-medium">Loading event handlers...</p>
    </div>

    <p v-if="error" class="text-red-600 text-lg font-medium text-center mb-6">
      Error loading event handlers. Please try again later.
    </p>

    <button
      class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 mb-6"
      @click="toggleForm"
    >
      {{ showForm ? "Hide Form" : "Add New Event" }}
    </button>

    <form
      v-if="showForm"
      class="bg-blue-100 p-8 rounded-lg shadow-md mb-6"
      @submit.prevent="saveEventHandler"
    >
      <h2 class="text-xl font-bold mb-4 text-blue-900">
        {{ isEditing ? "Edit Event Handler" : "Add New Event Handler" }}
      </h2>
      <div class="mb-6">
        <label for="name" class="block text-blue-900 text-lg font-medium">
          Name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <div class="mb-6">
        <label
          for="description"
          class="block text-blue-900 text-lg font-medium"
        >
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        ></textarea>
      </div>
      <div class="mb-6">
        <label for="event_date" class="block text-blue-900 text-lg font-medium">
          Event Date
        </label>
        <input
          id="event_date"
          v-model="form.date"
          type="date"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          required
        />
      </div>
      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
      >
        {{ isEditing ? "Update Event" : "Add Event " }}
      </button>
    </form>

    <div v-if="eventHandlers.length" class="bg-blue-100 p-6 rounded-lg shadow-md">
      <ul class="space-y-4">
        <li
          v-for="eventHandler in eventHandlers"
          :key="eventHandler.id"
          class="p-4 border-b border-gray-200 flex items-start justify-between"
        >
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-blue-900">
              {{ eventHandler.name }}
            </h2>
            <p class="text-blue-900">
              Description: {{ eventHandler.description }}<br />
              <span class="text-blue-900">Date: {{ eventHandler.date }}</span>
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 space-x-4">
            <button
              class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              @click="editEventHandler(eventHandler)"
            >
              Edit
            </button>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
              @click="deleteEventHandler(eventHandler.id)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <p
      v-if="!eventHandlers.length && !loading && !error"
      class="text-gray-600 text-lg font-medium text-center"
    >
      No event handlers found.
    </p>
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted } from "vue";

export default {
  name: "EventHandlerManager",
  setup() {
    const eventHandlers = ref([]);
    const form = ref({
      name: "",
      description: "",
      date: "",
    });
    const isEditing = ref(false);
    const currentEventHandlerId = ref(null);
    const loading = ref(true);
    const error = ref(false);
    const showForm = ref(false);

    const fetchEventHandlers = async () => {
      loading.value = true;
      error.value = false;
      try {
        const response = await axios.get("/admin/event-handlers");
        eventHandlers.value = response.data;
      } catch (err) {
        console.error("Error fetching event handlers:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const saveEventHandler = async () => {
      const url = isEditing.value
        ? `/admin/event-handlers/${currentEventHandlerId.value}`
        : "/admin/event-handlers";
      const method = isEditing.value ? "put" : "post";

      try {
        await axios[method](url, form.value);
        form.value = {
          name: "",
          description: "",
          date: "",
        };
        isEditing.value = false;
        currentEventHandlerId.value = null;
        showForm.value = false;
        await fetchEventHandlers();
      } catch (err) {
        console.error("Error saving event handler:", err);
        error.value = true;
      }
    };

    const editEventHandler = (eventHandler) => {
      form.value = { ...eventHandler };
      isEditing.value = true;
      currentEventHandlerId.value = eventHandler.id;
      showForm.value = true;
    };

    const deleteEventHandler = async (id) => {
      if (confirm("Are you sure you want to delete this event handler?")) {
        try {
          await axios.delete(`/admin/event-handlers/${id}`);
          await fetchEventHandlers();
        } catch (err) {
          console.error("Error deleting event handler:", err);
          error.value = true;
        }
      }
    };

    const toggleForm = () => {
      showForm.value = !showForm.value;
      if (showForm.value) {
        isEditing.value = false;
        form.value = {
          name: "",
          description: "",
          date: "",
        };
      }
    };

    onMounted(fetchEventHandlers);

    return {
      eventHandlers,
      form,
      isEditing,
      saveEventHandler,
      editEventHandler,
      deleteEventHandler,
      loading,
      error,
      showForm,
      toggleForm,
    };
  },
};
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1.5s linear infinite;
}

input:focus,
textarea:focus,
button:focus,
a:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}
</style>
