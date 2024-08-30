<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg w-80">
      <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="confirmAction"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          Confirm
        </button>
        <button
          @click="cancelAction"
          class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Confirm",
    },
    message: {
      type: String,
      default: "Are you sure?",
    },
  },
  methods: {
    confirmAction() {
      this.$emit("confirm");
    },
    cancelAction() {
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped></style>
