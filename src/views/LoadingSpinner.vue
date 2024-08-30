<template>
  <div class="flex flex-col items-center justify-center space-y-4 mt-4">
    <div class="loader"></div>
    <p class="text-blue-600 font-medium">Logging In...</p>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
};
</script>

<style scoped>
.loader {
  border: 4px solid rgba(243, 243, 243, 1);
  border-radius: 50%;
  border-top: 4px solid rgba(52, 152, 219, 1);
  border-right: 4px solid rgba(52, 152, 219, 0.7);
  border-bottom: 4px solid rgba(52, 152, 219, 0.5);
  border-left: 4px solid rgba(52, 152, 219, 0.3);
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
