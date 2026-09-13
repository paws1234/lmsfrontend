<template>
    <div class="page">
        <header class="page__head">
            <p class="page__eyebrow">Student portal</p>
            <h1 class="page__title">Enrolled subjects</h1>
            <p class="page__lead">
                The subjects you are enrolled in, with the schedule your teacher set.
            </p>
        </header>

        <p v-if="loading" class="sr-only" role="status">Loading subjects…</p>

        <p v-if="error" class="alert alert-error" role="alert">
            {{ error }}
            <button type="button" class="btn btn-ghost alert__action" @click="fetchSubjects">
                Try again
            </button>
        </p>

        <PanelCard v-else title="Your subjects" :loading="loading" :empty="!subjects.length"
            empty-title="No subjects enrolled yet"
            empty-text="Your teacher enrolls you into a subject; it then appears here.">
            <ul class="record-list">
                <li v-for="subject in subjects" :key="subject.subject_title" class="record">
                    <div>
                        <h2 class="record__title">{{ subject.subject_title }}</h2>
                        <p v-if="subject.subject_description" class="record__meta">
                            {{ subject.subject_description }}
                        </p>
                    </div>
         
                    <p v-if="subject.subject_schedule" class="record__facts">
                        <span class="record__fact">
                            <span class="record__fact-label">Schedule</span>
                            {{ subject.subject_schedule }}
                        </span>
                    </p>
                </li>
            </ul>
   
        </PanelCard>
    </div>
</template>
<script>
import axios from "@/axios";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";

export default {
    name: "StudentEnrolledSubjects",
    components: { PanelCard },
    data() {
        return {
        // The endpoint is `/student/{studentId}/subjects`, so it needs an id.
        // Unchanged from before: sourcing the signed-in student's own id changes
        // what the page asks the API for, which is not a presentation change.
        studentId: 1,
        subjects: [],
        loading: true,
        error: "",
        };
    },
    created() {
        this.fetchSubjects();
    },
    methods: {
        async fetchSubjects() {
          this.loading = true;
          this.error = "";
          try {
              const response = await axios.get(`/student/${this.studentId}/subjects`);
              this.subjects = response.data;
          } catch (error) {
          this.error = apiErrorMessage(
              error,
              "We couldn't load your enrolled subjects.",
          );
      } finally {
          this.loading = false;
            }
        },
    },
};
</script>
