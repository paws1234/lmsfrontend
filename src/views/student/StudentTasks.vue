<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Student portal</p>
      <h1 class="page__title">Your tasks</h1>
      <p class="page__lead">
        Work set by your teachers, grouped by subject and the day it was posted.
        Answer the questions for a day in one go.
      </p>
    </header>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button
        type="button"
        class="btn btn-ghost alert__action"
        @click="fetchTasks"
      >
        Try again
      </button>
    </p>

    <div v-else-if="loading" class="card card-pad stack" aria-hidden="true">
      <span class="skeleton task-skeleton"></span>
      <span class="skeleton task-skeleton"></span>
      <p class="sr-only" role="status">Loading your tasks…</p>
    </div>

    <template v-else>
      <div class="tabs" role="tablist" aria-label="Your work">
        <button
          id="tab-todos"
          type="button"
          role="tab"
          class="tabs__tab"
          :aria-selected="activeView === 'todos' ? 'true' : 'false'"
          aria-controls="panel-todos"
          @click="toggleView('todos')"
        >
          Tasks
        </button>
        <button
          id="tab-questions"
          type="button"
          role="tab"
          class="tabs__tab"
          :aria-selected="activeView === 'questions' ? 'true' : 'false'"
          aria-controls="panel-questions"
          @click="toggleView('questions')"
        >
          Questions
        </button>
      </div>

      <section
        v-show="activeView === 'todos'"
        id="panel-todos"
        role="tabpanel"
        aria-labelledby="tab-todos"
        class="stack"
      >
        <div v-if="!todoGroups.length" class="empty-state">
          <p class="empty-state-title">No tasks yet</p>
          <p>Tasks your teachers set for your subjects appear here.</p>
        </div>

        <PanelCard
          v-for="group in todoGroups"
          :key="group.subjectId"
          :title="group.subjectTitle"
        >
          <div v-for="day in group.dates" :key="day.date" class="day">
            <h3 class="day__date">Posted {{ day.date }}</h3>
            <ul class="task-list">
              <li v-for="todo in day.items" :key="todo.id" class="task">
                <h4 class="task__title">{{ todo.title }}</h4>
                <p v-if="todo.description" class="record__meta">
                  {{ todo.description }}
                </p>

                <div v-if="todo.file" class="task__attachment">
                  <img
                    v-if="isImage(todo.file)"
                    :src="todo.file"
                    alt="Attachment preview"
                    class="task__image"
                  />
                  <iframe
                    v-else-if="isPDF(todo.file) || isTextFile(todo.file)"
                    :src="todo.file"
                    title="Attachment"
                    class="task__frame"
                  ></iframe>
                  <button
                    v-else
                    type="button"
                    class="btn btn-ghost"
                    @click="downloadFile(todo.file)"
                  >
                    Download attachment
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </PanelCard>
      </section>

      <section
        v-show="activeView === 'questions'"
        id="panel-questions"
        role="tabpanel"
        aria-labelledby="tab-questions"
        class="stack"
      >
        <div v-if="!questionGroups.length" class="empty-state">
          <p class="empty-state-title">No questions yet</p>
          <p>Forms your teachers publish for your subjects appear here.</p>
        </div>

        <PanelCard
          v-for="group in questionGroups"
          :key="group.subjectId"
          :title="group.subjectTitle"
        >
          <div v-for="day in group.dates" :key="day.date" class="day">
            <!-- One button per day, at the day level: the dialog submits a
                 whole day's answers, so per-question buttons asked the same
                 question several times. -->
            <div class="day__head">
              <h3 class="day__date">Posted {{ day.date }}</h3>
              <button
                type="button"
                class="btn btn-primary"
                @click="openAnswerModal(day)"
              >
                Answer these questions
              </button>
            </div>

            <ul class="task-list">
              <li
                v-for="question in day.items"
                :key="question.question_id"
                :data-question-id="question.question_id"
                class="task"
              >
                <h4 class="task__title">{{ question.question_text }}</h4>
                <p class="record__meta">
                  {{ question.points }}
                  {{ question.points === 1 ? "point" : "points" }}
                </p>

                <ul
                  v-if="question.answers && question.answers.length"
                  class="answer-list"
                >
                  <li
                    v-for="answer in question.answers"
                    :key="answer.id"
                    :data-answer-id="answer.id"
                    class="answer"
                  >
                    {{ answer.answer_text }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </PanelCard>
      </section>
    </template>

    <ModalPopup
      :is-visible="isModalOpen"
      title="Submit your answers"
      confirm-label="Submit answers"
      @confirm="submitAnswers"
      @cancel="closeModal"
    >
      <p v-if="submitError" class="form-error" role="alert">
        {{ submitError }}
      </p>

      <form class="form" @submit.prevent="submitAnswers">
        <fieldset
          v-for="(question, index) in modalQuestions"
          :key="question.question_id"
          class="choice-set"
        >
          <legend class="choice-set__legend">
            {{ question.question_text }}
          </legend>

          <label
            v-for="answer in question.answers"
            :key="answer.id"
            class="choice"
          >
            <input
              v-model="selectedAnswers[question.question_id]"
              type="radio"
              :name="'answer_' + index"
              :value="answer.id"
              class="choice__input"
            />
            <span>{{ answer.answer_text }}</span>
          </label>
        </fieldset>
      </form>
    </ModalPopup>
  </div>
</template>

<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

/**
 * Bucket a list by the calendar day of one of its timestamps.
 *
 * Returns `[{ date, items }]` rather than an object, so the template can rely
 * on order and use `date` as a stable key.  An entry with no usable timestamp
 * is grouped under "No date" instead of throwing.
 */
function groupByDay(entries, pickTimestamp) {
  const buckets = new Map();

  (entries || []).forEach((entry) => {
    const raw = pickTimestamp(entry);
    const parsed = raw ? new Date(raw) : null;
    const key =
      parsed && !Number.isNaN(parsed.getTime())
        ? parsed.toLocaleDateString()
        : "No date";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  });

  return Array.from(buckets, ([date, items]) => ({ date, items }));
}

/** The API answers `{ [subjectId]: [{ subject_title, todos|questions }] }`. */
function subjectGroups(bySubject, pickItems, pickTimestamp) {
  return Object.entries(bySubject).map(([subjectId, entries]) => {
    const first = (entries && entries[0]) || {};
    return {
      subjectId,
      subjectTitle: first.subject_title || "Subject",
      dates: groupByDay(pickItems(first), pickTimestamp),
    };
  });
}

export default {
  name: "StudentTasks",
  components: { PanelCard, ModalPopup },
  data() {
    return {
      activeView: "todos",
      todosBySubject: {},
      questionsBySubject: {},
      loading: true,
      loadError: "",
      isModalOpen: false,
      modalQuestions: [],
      selectedAnswers: {},
      currentFormMapId: null,
      submitError: "",
    };
  },
  computed: {
    todoGroups() {
      return subjectGroups(
        this.todosBySubject,
        (first) => first.todos,
        (todo) => todo.created_at,
      );
    },
    questionGroups() {
      return subjectGroups(
        this.questionsBySubject,
        (first) => first.questions,
        // Falls back to the question's own timestamp: a question with no
        // answers would otherwise throw here and blank the whole page.
        (question) =>
          question.answers && question.answers.length
            ? question.answers[0].created_at
            : question.created_at,
      );
    },
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    async fetchTasks() {
      this.loading = true;
      this.loadError = "";
      try {
        const response = await axios.get("/student/tasks");
        this.todosBySubject = response.data.todos_by_subject;
        this.questionsBySubject = response.data.questions_by_subject;
      } catch (error) {
        this.loadError = apiErrorMessage(error, "We couldn't load your tasks.");
      } finally {
        this.loading = false;
      }
    },
    toggleView(view) {
      this.activeView = view;
    },
    isImage(file) {
      return /\.(jpg|jpeg|png|gif)$/i.test(file);
    },
    isPDF(file) {
      return /\.pdf$/i.test(file);
    },
    isTextFile(file) {
      return /\.txt$/i.test(file);
    },
    downloadFile(file) {
      window.open(file, "_blank");
    },
    /** Opens the answer dialog for one day's questions. */
    openAnswerModal(day) {
      this.modalQuestions = day.items;
      const first = day.items[0];
      this.currentFormMapId = first ? first.form_map_id : null;
      this.selectedAnswers = {};
      this.submitError = "";
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.modalQuestions = [];
      this.currentFormMapId = null;
      this.selectedAnswers = {};
      this.submitError = "";
    },
    async submitAnswers() {
      this.submitError = "";

      const answeredQuestions = this.modalQuestions.filter(
        (question) => this.selectedAnswers[question.question_id],
      );

      // Was an `alert()`: a modal on top of a modal, and it said nothing about
      // which questions were still blank.
      if (answeredQuestions.length === 0) {
        this.submitError = "Choose an answer for at least one question first.";
        return;
      }

      const payload = {
        form_map_id: this.currentFormMapId,
        submissions: answeredQuestions.map((question) => ({
          question_id: question.question_id,
          answer_id: this.selectedAnswers[question.question_id],
        })),
      };

      try {
        await axios.post("/student/submit-answers", payload);
        this.closeModal();
      } catch (error) {
        this.submitError = apiErrorMessage(
          error,
          "We couldn't submit your answers. Please try again.",
        );
      }
    },
  },
};
</script>

<style scoped>
.task-skeleton {
  display: block;
  height: 4rem;
}

/* A day is a labelled block inside a subject panel. */
.day + .day {
  margin-top: var(--space-6);
}

.day__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.day__date {
  font-size: var(--step-0);
  font-weight: 700;
  color: var(--text);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.task {
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
}

.task__title {
  font-size: var(--step-0);
  font-weight: 600;
  color: var(--text);
}

.task__attachment {
  margin-top: var(--space-3);
}

.task__image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius);
}

/* The viewer is a fixed fraction of the viewport rather than a fixed 24rem, so
   it stays usable on a phone and does not dominate a laptop. */
.task__frame {
  width: 100%;
  height: 60vh;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
  padding-left: var(--space-4);
  list-style: disc;
  color: var(--text-muted);
}

.choice-set {
  margin: 0;
  padding: 0;
  border: 0;
}

.choice-set + .choice-set {
  margin-top: var(--space-4);
}

.choice-set__legend {
  font-weight: 600;
  color: var(--text);
}

.choice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--text);
}

.choice__input {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
