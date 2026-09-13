<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Question list</h1>
      <p class="page__lead">
        Every question you have written, grouped by subject and topic, with the
        correct answer marked.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group"></div>
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/teacher/questions/create">
          Create CTU FORMS
        </router-link>
        <router-link class="btn btn-ghost" to="/teacher/todos">
          Back to TODOs
        </router-link>
      </div>
    </div>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="fetchQuestions">
        Try again
      </button>
    </p>

    <div v-else-if="loading" class="card card-pad stack" aria-hidden="true">
      <span class="skeleton question-skeleton"></span>
      <span class="skeleton question-skeleton"></span>
      <p class="sr-only" role="status">Loading questions…</p>
    </div>

    <div v-else-if="!subjectGroups.length" class="empty-state">
      <p class="empty-state-title">No questions yet</p>
      <p>
        Questions you create under CTU FORMS appear here, grouped by subject and
        topic.
      </p>
    </div>

    <template v-else>
      <PanelCard v-for="group in subjectGroups" :key="group.name" :title="group.name">
        <div class="stack question-topics">
          <section v-for="topic in group.topics" :key="topic.name">
            <h3 class="question-topic__name">{{ topic.name }}</h3>

            <p v-if="!topic.questions.length" class="record__meta">
              No questions in this topic yet.
            </p>

            <ul v-else class="question-list">
              <li v-for="question in topic.questions" :key="question.id" class="question">
                <div class="question__head">
                  <p class="question__text">{{ question.question_text }}</p>
                  <span class="badge question__points">
                    {{ question.points }}
                    {{ question.points === 1 ? "point" : "points" }}
                  </span>
                </div>

                <ul class="answer-list">
                  <li v-for="answer in question.answers" :key="answer.id" class="answer">
                    <span>
                      {{ answer.answer_text }}
                      <span v-if="answer.is_correct" class="badge badge--success answer__correct">
                        Correct
                      </span>
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </section>
        </div>
      </PanelCard>
    </template>
  </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";

export default {
  name: "TeacherQuestionList",
  components: { PanelCard },
  data() {
    return {
      questions: [],
      subjects: [],
      loading: true,
      loadError: "",
    };
  },
  computed: {
    /**
     * Subjects -> topics -> questions, as an array so the template does not
     * depend on object key order and each level has a stable `v-for` key.
     */
    subjectGroups() {
      const groups = new Map();

      this.questions.forEach((question) => {
        const subject = this.subjects.find((s) => s.id === question.subject_id);
        const subjectName = subject ? subject.title : "Uncategorized";
        const formMap = question.form_maps && question.form_maps[0];
        const topicName = formMap ? formMap.topic_name : "Uncategorized";

        if (!groups.has(subjectName)) groups.set(subjectName, new Map());
        const topics = groups.get(subjectName);
        if (!topics.has(topicName)) topics.set(topicName, []);
        topics.get(topicName).push(question);
      });

      return Array.from(groups, ([name, topics]) => ({
        name,
        topics: Array.from(topics, ([topicName, questions]) => ({
          name: topicName,
          questions,
        })),
      }));
    },
  },
  created() {
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      this.loading = true;
      this.loadError = "";
      try {
        // Both requests feed the grouping, so they run together rather than
        // making the second wait for the first.
        const [questions, subjects] = await Promise.all([
          axios.get("/teacher/questions"),
          axios.get("/teacher/getSubjects"),
        ]);
        this.questions = questions.data;
        this.subjects = subjects.data;
      } catch (error) {
        this.loadError = apiErrorMessage(
          error,
          "We couldn't load your questions.",
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.question-skeleton {
  display: block;
  height: 3rem;
}

/* The subject panels carry their own spacing, so the topic list only needs a
   rhythm between topics. */
.question-topics {
  gap: var(--space-6);
}

.question-topic__name {
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border);
  font-size: var(--step-1);
  font-weight: 700;
  color: var(--text);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.question {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
}

.question__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
}

.question__text {
  font-weight: 600;
  color: var(--text);
}
.question__points {
  flex-shrink: 0;
}
.answer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-3);
  padding-left: var(--space-4);
  list-style: disc;
  color: var(--text-muted);
}
/* Markers inherit the muted text colour, which is right for the bullet but
   would put the "Correct" badge on top of it. */
.answer__correct {
  margin-left: var(--space-2);
}
</style>
