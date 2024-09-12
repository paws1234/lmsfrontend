<template>
    <div class="p-6 bg-gray-100 min-h-screen">
      <h2 class="text-3xl font-bold mb-6 text-gray-800">Questions List</h2>
      
      <div v-if="questions.length === 0" class="text-gray-500">
        No questions available.
      </div>
  
      <ul v-else class="space-y-4">
        <li v-for="question in questions" :key="question.id" class="p-4 bg-white shadow-lg rounded-lg">
          <h3 class="text-xl font-semibold">{{ question.question_text }}</h3>
          <p class="text-gray-700">Points: {{ question.points }}</p>
          <ul class="mt-2 space-y-2">
            <li v-for="answer in question.answers" :key="answer.id" class="text-gray-600">
              {{ answer.answer_text }} - Correct: {{ answer.is_correct ? 'Yes' : 'No' }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from "@/axios";
  
  export default {
    data() {
      return {
        questions: []
      };
    },
    async created() {
      try {
        const response = await axios.get('/teacher/questions');
        this.questions = response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add component-specific styles here */
  </style>
  