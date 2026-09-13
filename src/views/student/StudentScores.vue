<template>
  <div class="scores max-w-4xl mx-auto p-4">
    <h2 class="text-3xl font-semibold text-center text-gray-800 mb-6">Your Scores</h2>

    <div v-if="loading" class="flex flex-col items-center justify-center space-y-4 mb-6">
      <div class="spinner"></div>
      <p class="text-lg font-medium text-gray-600">Loading scores…</p>
    </div>

    <div v-else-if="isEmpty" class="empty-state">
      <p class="empty-state-title">No scores yet</p>
      <p>They appear once your teacher publishes results.</p>
    </div>

    <p v-else-if="error" class="alert alert-error">
      We couldn't load your scores. Please try again later.
    </p>

    <template v-else>
      <div v-for="(formScores, formMapId) in scoresByFormMapId" :key="formMapId" class="mb-6">
        <div class="bg-white shadow-lg rounded-lg p-4">
          <h3 class="text-2xl font-bold text-gray-700 mb-4">Form: {{ formMapId }}</h3>
          <ul class="space-y-4">
            <li v-for="(score, index) in formScores" :key="index"
              class="flex justify-between items-center border-b pb-4">
              <div>
                <p class="text-lg font-medium text-gray-600">
                  Correct Answer: <span class="font-bold text-blue-600">{{ score.correct_answers_count }}</span> /
                  Perfect Score: <span class="font-bold text-blue-600">{{ score.perfect_score || score.total_submissions
                    }}</span>
                </p>
                <p class="text-xl font-semibold text-gray-800 mt-2">
                  <span class="text-green-500">{{ score.correct_answers_count }}</span> /
                  <span class="text-gray-500">{{ score.total_submissions }}</span>
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <span v-if="score.correct_answers_count === score.total_submissions"
                  class="text-green-500 font-bold text-lg">Perfect</span>
                <span v-else class="text-yellow-500 font-semibold"
                  @click="openReviewModal(score.submissions)">Review</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- Modal to review submission details -->
    <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-3xl">
        <h3 class="text-2xl font-semibold mb-4">Submission Details</h3>
        
        <!-- Table displaying the submission details -->
        <table class="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th class="border-b py-2 px-4 text-left">Question</th>
              <th class="border-b py-2 px-4 text-left">Your Answer</th>
              <th class="border-b py-2 px-4 text-left">Correct Answer</th>
              <th class="border-b py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(submission, index) in submissionDetails" :key="index">
              <td class="border-b py-2 px-4">{{ submission.question.text }}</td>
              <td class="border-b py-2 px-4">{{ submission.answer.value }}</td>
              <td class="border-b py-2 px-4">{{ getCorrectAnswer(submission.question.id) }}</td>
              <td class="border-b py-2 px-4">
                <span v-if="submission.is_correct" class="text-green-500">Correct</span>
                <span v-else class="text-red-500">Wrong</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Close Modal Button -->
        <div class="mt-4 flex justify-end">
          <button @click="closeModal" class="bg-red-500 text-white py-2 px-4 rounded">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "StudentScores",
  data() {
    return {
      scores: {},
      scoresByFormMapId: {},
      loading: true,
      error: false,
      isModalOpen: false,
      submissionDetails: [],
    };
  },
  computed: {
    /* Only claim there is nothing to show once the request has finished and
       actually succeeded — otherwise an empty list would flash before the
       scores arrive, or hide a failure behind a reassuring message. */
    isEmpty() {
      return (
        !this.loading &&
        !this.error &&
        Object.keys(this.scoresByFormMapId).length === 0
      );
    },
  },
  created() {
    this.fetchScores();
  },
  methods: {
    async fetchScores() {
      this.loading = true;
      this.error = false;
      try {
        const response = await axios.get('/student/scores');
        this.scores = response.data.score_data;
        this.groupScoresByFormMapId();
      } catch (error) {
        // The API answers 404 (with an encrypted, unreadable body) when the
        // student has no submissions yet.  That is an empty result, not a
        // failure, so it becomes the empty state instead of a console error.
        if (error.response && error.response.status === 404) {
          this.scores = {};
          this.scoresByFormMapId = {};
        } else {
          this.error = true;
          console.error("Error fetching scores:", error);
        }
      } finally {
        this.loading = false;
      }
    },
    groupScoresByFormMapId() {
      const grouped = {};
      for (const formMapId in this.scores) {
        const score = this.scores[formMapId];
        if (!grouped[formMapId]) {
          grouped[formMapId] = [];
        }
        grouped[formMapId].push(score);
      }
      this.scoresByFormMapId = grouped;
    },
    openReviewModal(submissions) {
      this.submissionDetails = submissions.map(submission => ({
        ...submission,
        question: submission.question || {},
        answer: submission.answer || {}
      }));
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.submissionDetails = [];
    },
    getCorrectAnswer(questionId) {
      const correctSubmission = this.submissionDetails.find(sub => sub.question.id === questionId && sub.is_correct);
      return correctSubmission ? correctSubmission.answer.value : "Not available";
    }
  },
};
</script>

<style scoped>
/* Custom styling for modal and table */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px 16px;
}

th {
  background-color: #f4f4f4;
}

td {
  text-align: left;
}

button {
  transition: background-color 0.3s;
}

button:hover {
  background-color: #c53030;
}
</style>
