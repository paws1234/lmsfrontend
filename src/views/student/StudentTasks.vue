
<template>

  <div class="flex">
    <div class="p-6 space-y-6 flex-1 lg:ml-64">
      <h2 class="text-2xl font-semibold text-gray-800">Your Tasks</h2>
      <div class="flex space-x-4">
        <button @click="toggleView('todos')"
          :class="{ 'bg-blue-500 text-white': activeView === 'todos', 'bg-gray-200': activeView !== 'todos' }"
          class="py-2 px-4 rounded-md hover:bg-blue-400 transition duration-300">
          Tasks
        </button>
        <button @click="toggleView('questions')"
          :class="{ 'bg-blue-500 text-white': activeView === 'questions', 'bg-gray-200': activeView !== 'questions' }"
          class="py-2 px-4 rounded-md hover:bg-blue-400 transition duration-300">
          Questions
        </button>
      </div>
      <div v-if="activeView === 'todos'" class="space-y-6">
        <h3 class="text-xl font-medium text-gray-800">Tasks</h3>
        <p class="text-gray-600">Here are your pending tasks. Follow the instructions and check any attachments for
          additional resources.</p>
        <div v-for="(subjectTodos, subjectId) in groupedTodosByDate" :key="subjectId" class="space-y-6">
          <h4 class="text-lg font-semibold">Subject: {{ subjectTodos[0]?.subject_title }}</h4>
          <div v-for="(todoGroup, date) in subjectTodos[0]?.groupedTodos" :key="date">
            <h5 class="font-semibold text-gray-800 mt-4">Date: {{ date }}</h5>
            <div v-for="(todo, index) in todoGroup" :key="index" class="bg-white p-4 rounded-md shadow-md">
              <h4 class="font-semibold text-lg">Title: {{ todo.title }}</h4>
              <p class="text-gray-700">Instructions: {{ todo.description }}</p>
              <div v-if="todo.file" class="mt-4">
                <h5 class="font-medium text-gray-800">Attached File:</h5>
                <div v-if="isImage(todo.file)" class="space-y-2">
                  <img :src="todo.file" alt="Attachment Preview" class="max-w-full h-auto rounded-md shadow-md" />
                </div>
                <div v-if="isPDF(todo.file)" class="space-y-2">
                  <iframe :src="todo.file" class="w-full h-96 border-none rounded-md shadow-md"></iframe>
                </div>
                <div v-if="isTextFile(todo.file)" class="space-y-2">
                  <iframe :src="todo.file" class="w-full h-96 border-none rounded-md shadow-md"></iframe>
                </div>
                <div v-if="!isImage(todo.file) && !isPDF(todo.file) && !isTextFile(todo.file)" class="space-y-2">
                  <button @click="downloadFile(todo.file)" class="text-blue-500 hover:text-blue-700 cursor-pointer">
                    Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeView === 'questions'" class="space-y-6">
        <h3 class="text-xl font-medium text-gray-800">Questions</h3>
     
  <p class="text-gray-600">
    Here are the questions you need to answer. Make sure to read through the provided answers and notes.
  </p>
  <div v-for="(subjectQuestions, subjectId) in groupedQuestionsByDate" :key="subjectId" class="space-y-6">
    <h4 class="text-lg font-semibold">Subject: {{ subjectQuestions[0]?.subject_title }}</h4>
    <button @click="toggleSubjectVisibility(subjectId)">
      {{ subjectVisibility[subjectId] ? 'Hide' : 'Show' }} Questions
    </button>
    <div v-if="subjectVisibility[subjectId]">
      <div v-for="(questionGroup, date) in subjectQuestions[0]?.groupedQuestions" :key="date">
        <h5 class="font-semibold text-gray-800 mt-4">Date: {{ date }}</h5>
        <div v-for="(question, index) in questionGroup" :key="index" class="bg-white p-4 rounded-md shadow-md">
          <h4 class="font-semibold text-lg" :data-question-id="question.question_id" :data-form-map-id="question.form_map_id">
            Question: {{ question.question_text }}
          </h4>
          <p class="text-gray-700">Points: {{ question.points }}</p>
          <div v-if="question.answers && question.answers.length > 0">
            <ul class="list-disc pl-6">
              <p class="text-gray-700">Answers:</p>
              <li 
                v-for="(answer, idx) in question.answers" 
                :key="idx"
                :data-answer-id="answer.id"
              >
                {{ answer.answer_text }}
              </li>
            </ul>
          </div>
          <!-- Only show the 'Select Answer' button once per date -->
          <div v-if="!selectedDateHasButton[date]">
            <button @click="openAnswerModal(questionGroup, question.form_map_id, date)" class="text-blue-500 hover:text-blue-700">
              Select Answer
            </button>
            <!-- Mark the date as having the button displayed -->
            <span :data-date="date" @click="markDateAsShown(date)" class="hidden"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- Modal for Answering Questions -->
<div v-if="isModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-1/3 text-gray-800">
     
    <h3 class="text-2xl font-semibold mb-4">Submit Your Answer</h3>
    <form @submit.prevent="submitAnswers">
      <div v-for="(question, index) in modalQuestions" :key="index" class="mb-4">
        <label class="block text-lg font-medium" :data-question-id="question.question_id">
          {{ question.question_text }}
        </label>
        <div class="mt-2 space-y-2">
          <div v-for="(answer, answerIndex) in question.answers" :key="answerIndex">
            <label class="flex items-center">
              <input 
                type="radio" 
                :name="'answer_' + index" 
                v-model="selectedAnswers[question.question_id]"
                :value="answer.id" 
                class="mr-2"
              >
              <span :data-answer-id="answer.id">{{ answer.answer_text }}</span>
            </label>
          </div>
        </div>
      </div>
      <button type="submit" class="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md">Submit</button>
      <button @click="closeModal" type="button" class="mt-4 py-2 px-4 bg-gray-300 text-gray-800 rounded-md">
        Close
      </button>
    </form>
  </div>
</div>
</div>
</div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "StudentTasks",
  data() {
    return {
      activeView: 'todos',
      todosBySubject: {},
      questionsBySubject: {},
      subjectVisibility: {},
      groupedQuestionsByDate: {},
      groupedTodosByDate: {},
      isModalOpen: false,
      modalQuestions: [],
      selectedAnswers: {}, // Stores selected answers for questions
      currentFormMapId: null,
      selectedDateHasButton: {} // Tracks the current form_map_id
    };
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    markDateAsShown(date) {
    this.selectedDateHasButton[date] = true;
  },
    toggleView(view) {
      this.activeView = view;
    },
    async fetchTasks() {
      try {
        const response = await axios.get('/student/tasks');
        this.todosBySubject = response.data.todos_by_subject;
        this.questionsBySubject = response.data.questions_by_subject;
        this.groupTodosByDate();
        this.groupQuestionsByDate();
        for (const subjectId in this.questionsBySubject) {
          this.subjectVisibility[subjectId] = false;
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },
    toggleSubjectVisibility(subjectId) {
      this.subjectVisibility[subjectId] = !this.subjectVisibility[subjectId];
    },
    isImage(file) {
      return file.match(/\.(jpg|jpeg|png|gif)$/i);
    },
    isPDF(file) {
      return file.match(/\.pdf$/i);
    },
    isTextFile(file) {
      return file.match(/\.(txt)$/i);
    },
    downloadFile(file) {
      window.open(file, '_blank');
    },
    groupQuestionsByDate() {
  for (const subjectId in this.questionsBySubject) {
    const subjectQuestions = this.questionsBySubject[subjectId];
    const groupedQuestions = subjectQuestions[0]?.questions.reduce((acc, question) => {
      const date = new Date(question.answers[0].created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(question);
      return acc;
    }, {});
    
    this.groupedQuestionsByDate[subjectId] = [
      { subject_title: subjectQuestions[0]?.subject_title, groupedQuestions }
    ];
  }
},
    groupTodosByDate() {
      for (const subjectId in this.todosBySubject) {
        const subjectTodos = this.todosBySubject[subjectId];
        const groupedTodos = subjectTodos[0]?.todos.reduce((acc, todo) => {
          const date = new Date(todo.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(todo);
          return acc;
        }, {});
        this.groupedTodosByDate[subjectId] = [
          { subject_title: subjectTodos[0]?.subject_title, groupedTodos }
        ];
      }
    },
    openAnswerModal(questionGroup, formMapId) {
      this.modalQuestions = questionGroup;
      this.currentFormMapId = formMapId; // Set current form_map_id for the modal
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.modalQuestions = [];
      this.currentFormMapId = null;
      this.selectedAnswers = {}; // Reset selected answers
    },
    selectAnswer(questionId, answerId) {
      // Store the selected answer for each question
      this.selectedAnswers[questionId] = answerId;
    },
    async submitAnswers() {
      
  try {
    
    // Filter out questions without selected answers
    const answeredQuestions = this.modalQuestions.filter(
      question => this.selectedAnswers[question.question_id]
    );

    if (answeredQuestions.length === 0) {
      alert("Please select answers for at least one question.");
      return;
    }

    // Prepare the submission payload with only answered questions
    const submissions = answeredQuestions.map(question => ({
      question_id: question.question_id,
      answer_id: this.selectedAnswers[question.question_id]
    }));

    const payload = {
      form_map_id: this.currentFormMapId,
      submissions
    };

    // Send the submission to the backend
    await axios.post('/student/submit-answers', payload);
    this.closeModal();
    console.log("Answers submitted successfully.");
  } catch (error) {
    console.error("Error submitting answers:", error);
  }
}
  }
};
</script>


<style scoped>
/* Add custom styling as needed */
</style>
