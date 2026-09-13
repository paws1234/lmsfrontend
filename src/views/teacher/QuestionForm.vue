<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">CTU FORMS</h1>
      <p class="page__lead">
        Build a form for one subject: a topic, then as many questions as you
        need, each with its answer choices. Tick every choice that is correct.
      </p>
    </header>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

    <p v-if="notice" class="alert alert-success" role="status">{{ notice }}</p>

    <form class="stack" @submit.prevent="submitForm">
      <div class="card card-pad stack">
        <div class="form-grid form-grid--2">
          <div>
            <label class="form-label" for="form_topic">Form topic</label>
            <input id="form_topic" v-model="form_topic" class="form-field" type="text"
              placeholder="e.g. Introduction to HTML" required />
          </div>

          <div>
            <label class="form-label" for="subject">Subject</label>
            <select id="subject" v-model="form_subject" class="form-field" required>
              <option value="" disabled>Select a subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.title }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <section v-for="(question, questionIndex) in questions" :key="questionIndex" class="card card-pad stack"
        :aria-labelledby="'question-heading-' + questionIndex">
        <div class="question-form__head">
          <h2 :id="'question-heading-' + questionIndex" class="section-title">
            Question {{ questionIndex + 1 }}
          </h2>
          <!-- Disabled rather than silently ignored when it is the last
               question, so the button never looks broken. -->
          <button type="button" class="action-link action-link--danger" :disabled="questions.length === 1"
            @click="removeQuestion(questionIndex)">
            Remove question
          </button>
        </div>

        <div class="form-grid form-grid--2">
          <div>
            <label class="form-label" :for="'question_text_' + questionIndex">
              Question
            </label>
            <input :id="'question_text_' + questionIndex" v-model="question.question_text" class="form-field"
              type="text" placeholder="What are you asking?" required />
          </div>

          <div>
            <label class="form-label" :for="'points_' + questionIndex">
              Points
            </label>
            <input :id="'points_' + questionIndex" v-model="question.points" class="form-field" type="number" min="1"
              required />
          </div>
        </div>

        <fieldset class="question-form__answers">
          <legend class="form-label">Answer choices</legend>

          <div v-for="(answer, answerIndex) in question.answers" :key="answerIndex" class="question-form__answer">
            <input :id="`answer-${questionIndex}-${answerIndex}`" v-model="answer.answer_text" class="form-field"
              type="text" :placeholder="`Choice ${answerIndex + 1}`" required />
            <label class="question-form__correct" :for="`answer-${questionIndex}-${answerIndex}`">
              <input v-model="answer.is_correct" type="checkbox" class="question-form__checkbox" />
              Correct
            </label>
            <button type="button" class="action-link action-link--danger" :disabled="question.answers.length === 1"
              @click="removeAnswer(questionIndex, answerIndex)">
              Remove
            </button>
          </div>

          <button type="button" class="btn btn-ghost" @click="addAnswer(questionIndex)">
            Add another choice
          </button>
        </fieldset>
      </section>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? "Saving…" : "Save questions" }}
        </button>
        <button type="button" class="btn btn-ghost" @click="addQuestion">
          Add another question
        </button>
        <router-link class="btn btn-ghost" to="/teacher/questions/list">
          View questions
        </router-link>
      </div>
    </form>
  </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";

/** One blank question, so "add question" and the initial state agree. */
const blankQuestion = () => ({
  question_text: "",
  points: 1,
  answers: [{ answer_text: "", is_correct: false }],
});

export default {
  name: "QuestionForm",
  data() {
    return {
      form_topic: "",
      form_subject: "",
      subjects: [],
      questions: [blankQuestion()],
      saving: false,
      error: "",
      notice: "",
    };
  },
  created() {
    this.fetchSubjects();
  },
  methods: {
    async fetchSubjects() {
      try {
        const response = await axios.get("/teacher/getSubjects");
        this.subjects = response.data;
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't load your subjects, so the subject list is empty.",
        );
      }
    },
    addQuestion() {
      this.questions.push(blankQuestion());
    },
    removeQuestion(index) {
      // Guarded here as well as on the button: a form with no questions has
      // nothing to submit.
      if (this.questions.length > 1) this.questions.splice(index, 1);
    },
    addAnswer(questionIndex) {
      this.questions[questionIndex].answers.push({
        answer_text: "",
        is_correct: false,
      });
    },
    removeAnswer(questionIndex, answerIndex) {
      const answers = this.questions[questionIndex].answers;
      // A question with no choices cannot be answered (or submitted), so the
      // last one stays.  The button carries the same rule as its `disabled`
      // state, so it never looks broken.
      if (answers.length > 1) answers.splice(answerIndex, 1);
    },
    async submitForm() {
      this.saving = true;
      this.error = "";
      this.notice = "";
      try {
        await axios.post("/teacher/questions", {
          form_topic: this.form_topic,
          subject_id: this.form_subject,
          questions: this.questions,
        });
        this.notice = "Questions saved. They now appear in the question list.";
      } catch (error) {
        this.error = apiErrorMessage(
          error,
          "We couldn't save these questions. Please try again.",
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.question-form__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
}

.question-form__answers {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}

/* Choice text, its "Correct" tick and its remove button on one row, wrapping
   on a narrow screen rather than squashing the text field. */
.question-form__answer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}

.question-form__answer .form-field {
  flex: 1 1 14rem;
  min-width: 0;
}

.question-form__correct {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

/* The native checkbox follows the control colours set in app.css, so it only
   needs a size. */
.question-form__checkbox {
  width: 1.15rem;
  height: 1.15rem;
}

.question-form__answers .btn {
  align-self: flex-start;
}
</style>
