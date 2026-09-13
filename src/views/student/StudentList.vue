<template>
    <div class="flex flex-col lg:flex-row">
        <div class="lg:w-1/4 w-full">
        </div>
        <div class="lg:w-3/4 w-full p-4 flex justify-center">
            <div class="w-full max-w-4xl">
                <h1 class="text-gray-800">Enrolled Subjects</h1>
                <div v-if="loading" class="loader">Loading...</div>
                <div v-else-if="subjects.length === 0" class="no-enrollments">
                    <p class="text-gray-600">No subjects enrolled yet.</p>
                </div>
                <div v-else>
                    <ul>
                        <li v-for="subject in subjects" :key="subject.subject_title" class="subject-item">
                            <h3>{{ subject.subject_title }}</h3>
                            <p>{{ subject.subject_description }}</p>
                            <p><strong>Schedule:</strong> {{ subject.subject_schedule }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from "@/axios";
export default {
    data() {
        return {
            studentId: 1,
            subjects: [],
            loading: true,
        };
    },
    created() {
        this.fetchSubjects();
    },
    methods: {
        async fetchSubjects() {
            try {
                const response = await axios.get(`/student/${this.studentId}/subjects`);
                this.subjects = response.data;
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                this.loading = false;
                console.log(this.subjects)
            }
        },
    },
};
</script>
<style scoped>
.subject-list {
    padding: 20px;
    background-color: var(--surface-muted);
    border-radius: 8px;
}

.subject-item {
    padding: 15px;
    border: 1px solid var(--border);
    margin-bottom: 10px;
    background-color: var(--surface-raised);
    border-radius: 4px;
}

.subject-item h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.subject-item p {
    font-size: 16px;
    color: var(--text-muted);
}

.subject-schedule {
    margin-top: 10px;
    font-size: 14px;
    color: var(--text-muted);
}

.loader {
    font-size: 20px;
    text-align: center;
    /* Was a fixed #333: on a dark page that is 1.3:1, i.e. invisible. */
        color: var(--text-muted);
}

.no-enrollments {
    text-align: center;
    color: var(--danger);
}
</style>
