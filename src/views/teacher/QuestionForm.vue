<template>
  <div class="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">CTU FORMS</h1>
    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="mb-4">
        <label for="form_topic" class="block text-gray-700 font-medium mb-2">Form Topic:</label>
        <input v-model="form_topic" id="form_topic" type="text" required
          class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the topic for this form" />
      </div>
      <div class="mb-4">
        <label for="subject" class="block text-gray-700 font-medium mb-2">Subject:</label>
        <select v-model="form_subject" id="subject" required
          class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option disabled value="">Select a subject</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.title }}
          </option>
        </select>
      </div>
      <div v-for="(question, questionIndex) in questions" :key="questionIndex"
        class="border border-gray-300 p-6 rounded-lg shadow-sm bg-gray-50">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Question {{ questionIndex + 1 }}</h2>
          <button @click="removeQuestion(questionIndex)" type="button"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Remove Question
          </button>
        </div>
        <div class="mb-4">
          <label :for="'question_text_' + questionIndex" class="block text-gray-700 font-medium mb-2">Question:</label>
          <input v-model="question.question_text" :id="'question_text_' + questionIndex" type="text" required
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question here" />
        </div>
        <div class="mb-4">
          <label :for="'points_' + questionIndex" class="block text-gray-700 font-medium mb-2">Points:</label>
          <input v-model="question.points" :id="'points_' + questionIndex" type="number" min="1" required
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter points" />
        </div>
        <div v-for="(answer, answerIndex) in question.answers" :key="answerIndex"
          class="flex items-center space-x-2 mb-4">
          <input v-model="answer.answer_text" placeholder="Answer text" required
            class="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <label class="inline-flex items-center space-x-2">
            <input v-model="answer.is_correct" type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" />
            <span class="text-gray-700">Correct</span>
          </label>
          <button @click="removeAnswer(questionIndex, answerIndex)" type="button"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Remove
          </button>
        </div>
        <button @click="addAnswer(questionIndex)" type="button"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Add Answer
        </button>
      </div>
      <button type="button" @click="addQuestion"
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
        Add Question
      </button>
      <button type="submit"
        class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
        Save Questions
      </button>
    </form>
  </div>
</template>
<script>
import axios from "@/axios";
export default {
  data() {
    return {
      form_topic: "",
      form_subject: "",
      subjects: [],
      questions: [
        {
          question_text: "",
          points: 1,
          answers: [{ answer_text: "", is_correct: false }],
        },
      ],
    };
  },
  created() {
    this.fetchSubjects();
  },
  methods: {
    fetchSubjects() {
      axios
        .get("/teacher/getSubjects")
        .then((response) => {
          this.subjects = response.data;
        })
        .catch((error) => {
          console.error("Error fetching subjects:", error);
        });
    },
    addQuestion() {
      this.questions.push({
        question_text: "",
        points: 1,
        answers: [{ answer_text: "", is_correct: false }],
      });
    },
    removeQuestion(index) {
      if (this.questions.length > 1) {
        this.questions.splice(index, 1);
      }
    },
    addAnswer(questionIndex) {
      this.questions[questionIndex].answers.push({ answer_text: "", is_correct: false });
    },
    removeAnswer(questionIndex, answerIndex) {
      this.questions[questionIndex].answers.splice(answerIndex, 1);
    },
    async submitForm() {
      try {
        await axios.post('/teacher/questions', {
          form_topic: this.form_topic,
          subject_id: this.form_subject,
          questions: this.questions
        });
        console.log('Questions saved successfully!');
      } catch (error) {
        console.error(error);
        console.log('Failed to save questions.');
      }
    },
  },
};
</script>
