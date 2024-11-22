<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Questions List</h2>
    <div v-if="Object.keys(groupedQuestions).length === 0" class="text-gray-500">
      No questions available.
    </div>
    <ul v-else class="space-y-4">
      <li v-for="(topics, subjectName) in groupedQuestions" :key="subjectName"
        class="p-4 bg-white shadow-lg rounded-lg">
        <h3 class="text-2xl font-semibold mb-4">{{ subjectName }}</h3>
        <div v-if="Object.keys(topics).length === 0" class="text-gray-500">
          No topics available for this subject.
        </div>
        <ul class="space-y-4">
          <li v-for="(questions, topic) in topics" :key="topic" class="p-4 bg-white shadow-md rounded-md">
            <h4 class="text-xl font-semibold">{{ topic }}</h4>
            <div v-if="questions.length === 0" class="text-gray-500">
              No questions available for this topic.
            </div>
            <ul class="mt-2 space-y-2">
              <li v-for="question in questions" :key="question.id" class="text-gray-600">
                {{ question.question_text }} - Points: {{ question.points }}
                <ul class="mt-2 space-y-2">
                  <li v-for="answer in question.answers" :key="answer.id" class="text-gray-600">
                    {{ answer.answer_text }} - Correct: {{ answer.is_correct ? 'Yes' : 'No' }}
                  </li>
                </ul>
              </li>
            </ul>
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
      questions: [],
      groupedQuestions: {},
      subjects: []
    };
  },
  async created() {
    try {
      const response = await axios.get('/teacher/questions');
      this.questions = response.data;
      const subjectsResponse = await axios.get('/teacher/getSubjects');
      this.subjects = subjectsResponse.data;
      this.groupQuestionsBySubjectAndTopic();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  methods: {
    groupQuestionsBySubjectAndTopic() {
      this.groupedQuestions = {};
      this.questions.forEach((question) => {
        const subject = this.subjects.find(subject => subject.id === question.subject_id);
        const subjectName = subject ? subject.title : "Uncategorized";
        const topicName = question.form_maps.length > 0 ? question.form_maps[0].topic_name : "Uncategorized";
        if (!this.groupedQuestions[subjectName]) {
          this.groupedQuestions[subjectName] = {};
        }
        if (!this.groupedQuestions[subjectName][topicName]) {
          this.groupedQuestions[subjectName][topicName] = [];
        }
        this.groupedQuestions[subjectName][topicName].push(question);
      });
    }
  }
};
</script>
<style scoped></style>
