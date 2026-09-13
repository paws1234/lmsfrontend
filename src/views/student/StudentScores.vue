<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Student portal</p>
      <h1 class="page__title">Your scores</h1>
      <p class="page__lead">
        Results are grouped by form. Where a form is not perfect you can open
        your answers and see what the correct one was.
      </p>
    </header>

    <p v-if="loading" class="sr-only" role="status">Loading scores…</p>

    <div v-else-if="profileMissing" class="empty-state">
      <p class="empty-state-title">Your profile is not set up yet</p>
      <p>
        Your account exists, but it is not linked to a student record, so there
        are no scores to show. Ask your administrator to enrol you.
      </p>
    </div>

    <div v-else-if="isEmpty" class="empty-state">
      <p class="empty-state-title">No scores yet</p>
      <p>They appear once your teacher publishes results.</p>
    </div>

    <p v-else-if="error" class="alert alert-error" role="alert">
      We couldn't load your scores.
      <button type="button" class="btn btn-ghost alert__action" @click="fetchScores">
        Try again
      </button>
    </p>

    <template v-else>
      <PanelCard v-for="(formScores, formMapId) in scoresByFormMapId" :key="formMapId" :title="`Form ${formMapId}`">
        <ul class="record-list">
          <li v-for="(score, index) in formScores" :key="index" class="record">
            <div>
              <p class="score">
                <span class="score__value">{{
                  score.correct_answers_count
                  }}</span>
                <span class="score__out-of">/ {{ score.perfect_score || score.total_submissions }}</span>
              </p>
              <p class="record__facts">
                <span class="record__fact">
                  <span class="record__fact-label">Correct</span>
                  {{ score.correct_answers_count }}
                </span>
                <span class="record__fact">
                  <span class="record__fact-label">Perfect score</span>
                  {{ score.perfect_score || score.total_submissions }}
                </span>
                <span class="record__fact">
                  <span class="record__fact-label">Submissions</span>
                  {{ score.total_submissions }}
                </span>
              </p>
            </div>
            <div class="record__actions">
              <span v-if="score.correct_answers_count === score.total_submissions" class="badge badge--success">
                Perfect
              </span>
              <!-- Used to be a `<span @click>`: unreachable by keyboard and
                   invisible to assistive technology as a control. -->
              <button v-else type="button" class="action-link" @click="openReviewModal(score.submissions)">
                Review answers
              </button>
            </div>
          </li>
        </ul>
      </PanelCard>
    </template>

    <ModalPopup :is-visible="isModalOpen" title="Submission details" confirm-label="Close" cancel-label=""
      @confirm="closeModal" @cancel="closeModal">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Question</th>
              <th scope="col">Your answer</th>
              <th scope="col">Correct answer</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(submission, index) in submissionDetails" :key="index">
              <td>{{ submission.question.text }}</td>
              <td>{{ submission.answer.value }}</td>
              <td>{{ getCorrectAnswer(submission.question.id) }}</td>
              <td>
                <span class="badge" :class="submission.is_correct ? 'badge--success' : 'badge--danger'
                  ">
                  {{ submission.is_correct ? "Correct" : "Wrong" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ModalPopup>
  </div>
</template>

<script>
import axios from "@/axios";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

/* ScoreController::index() answers 404 for two different situations and separates
   them only by message text — both use the same `message` key:

     "Student not found"                      -> no `students` row for this user
     "No submissions found for this student"  -> profile exists, nothing published

   Keep this in step with app/Http/Controllers/ScoreController.php. If that
   wording changes this stops matching and the page falls back to "No scores
   yet", i.e. the previous behaviour — it degrades quietly rather than wrongly. */
const NO_STUDENT_PROFILE = "student not found";

export default {
  name: "StudentScores",
  components: { PanelCard, ModalPopup },
  data() {
    return {
      scores: {},
      scoresByFormMapId: {},
      loading: true,
      error: false,
      profileMissing: false,
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
        !this.profileMissing &&
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
      this.profileMissing = false;
      try {
        const response = await axios.get("/student/scores");
        this.scores = response.data.score_data;
        this.groupScoresByFormMapId();
      } catch (error) {
        // A 404 means "nothing to show" rather than a failure — but it has two
        // causes, and the body is the only thing that distinguishes them.  The
        // error body is decrypted by the axios interceptor, so `message` is
        // readable here.
        if (error.response && error.response.status === 404) {
          this.scores = {};
          this.scoresByFormMapId = {};
          const message = error.response.data && error.response.data.message;
          this.profileMissing =
            typeof message === "string" &&
            message.toLowerCase().includes(NO_STUDENT_PROFILE);
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
      this.submissionDetails = submissions.map((submission) => ({
        ...submission,
        question: submission.question || {},
        answer: submission.answer || {},
      }));
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.submissionDetails = [];
    },
    getCorrectAnswer(questionId) {
      const correctSubmission = this.submissionDetails.find(
        (sub) => sub.question.id === questionId && sub.is_correct,
      );
      return correctSubmission
        ? correctSubmission.answer.value
        : "Not available";
    },
  },
};
</script>

<style scoped>
.score {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.score__value {
  font-size: var(--step-2);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text);
}

.score__out-of {
  color: var(--text-muted);
}
</style>
