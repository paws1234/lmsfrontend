<template>
  <div class="page">
    <header class="page__head">
      <p class="page__eyebrow">Teaching</p>
      <h1 class="page__title">Enrollments</h1>
      <p class="page__lead">
        Which students are in which subject. A student only sees the tasks and
        scores of the subjects they are enrolled in.
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar__group">
        <label class="sr-only" for="enrollment-search">Search enrollments</label>
        <input
id="enrollment-search"
v-model="searchQuery"
class="form-field search" type="search"
          placeholder="Search by student or subject" />
      </div>
      <div class="toolbar__group">
        <router-link class="btn btn-primary" to="/teacher/enrollments/create">
          Create enrollment
        </router-link>
      </div>
    </div>

    <p v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </p>

    <p v-if="loadError" class="alert alert-error" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-ghost alert__action" @click="reload">
        Try again
      </button>
    </p>

    <p v-if="actionError" class="alert alert-error" role="alert">
      {{ actionError }}
    </p>

    <PanelCard v-if="!loadError" title="All enrollments" :loading="loading" :empty="!filteredEnrollments.length"
      :empty-title="hasEnrollments
          ? 'No enrollments match your search'
          : 'Nobody is enrolled yet'
        " :empty-text="hasEnrollments
          ? 'Try a different word, or clear the search box.'
          : 'Enrol a student into a subject to get started.'
        ">
      <div class="table-wrap">
        <table class="table enrollment-table">
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Subject</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id">
              <td>{{ enrollment.student.name }}</td>
              <td>{{ enrollment.subject.title }}</td>
              <td>
                <button
type="button" class="action-link" @click="editEnrollment(enrollment)">
                  Edit
                </button>
                <button
type="button" class="action-link action-link--danger" @click="askDelete(enrollment)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>

    <!-- Edit dialog.  The two selects are the whole form, so the dialog's own
         confirming button is the submit action. -->
    <ModalPopup :is-visible="editingEnrollment" title="Edit enrollment" confirm-label="Save changes"
      :message="editMessage" @confirm="updateEnrollment" @cancel="cancelEdit"
    >
      <div class="form">
        <div>
          <label class="form-label" for="edit-student">Student</label>
          <select
id="edit-student"
            v-model="form.student_id"
class="form-field"
            @change="updateStudentName"
          >
            <option
              v-for="student in students"
              :key="student.id"
              :value="student.id"
            >
              {{ student.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label" for="edit-subject">Subject</label>
          <select
id="edit-subject"
            v-model="form.subject_id"
class="form-field"
            @change="updateSubjectTitle"
          >
            <option
              v-for="subject in subjects"
              :key="subject.id"
              :value="subject.id"
            >
              {{ subject.title }}
            </option>
          </select>
        </div>
      </div>
    </ModalPopup>

    <ModalPopup :is-visible="showModal" tone="danger" title="Delete this enrollment?" confirm-label="Delete"
      :message="deleteMessage" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import axios from "@/axios";
import { ref, onMounted, computed } from "vue";
import { apiErrorMessage } from "@/apiError";
import PanelCard from "@/components/PanelCard.vue";
import ModalPopup from "@/views/ModalPopup.vue";

export default {
  name: "EnrollmentList",
  components: { PanelCard, ModalPopup },
  setup() {
    const enrollments = ref([]);
    const searchQuery = ref("");
    const students = ref([]);
    const subjects = ref([]);
    const editingEnrollment = ref(false);
    const form = ref({ student_id: "", subject_id: "" });
    const student_name = ref("");
    const subject_title = ref("");
    const currentEnrollmentId = ref(null);
    const loading = ref(true);
    const loadError = ref("");
    const actionError = ref("");
    const notice = ref("");
    const showModal = ref(false);
    const enrollmentToDelete = ref(null);

    const fetchEnrollments = async () => {
      loading.value = true;
      loadError.value = "";
      try {
        const response = await axios.get("/teacher/enrollments");
        enrollments.value = response.data;
      } catch (error) {
        loadError.value = apiErrorMessage(
          error,
          "We couldn't load the enrollments.",
        );
      } finally {
        loading.value = false;
      }
    };

    /* The two pickers only matter once the edit dialog opens, so a failure
       here is reported without hiding the table that did load. */
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/teacher/getStudents");
        students.value = response.data;
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't load the student list needed to edit an enrollment.",
        );
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get("/teacher/getSubjects");
        subjects.value = response.data;
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't load the subject list needed to edit an enrollment.",
        );
      }
    };

    const reload = async () => {
      await fetchEnrollments();
      await fetchStudents();
      await fetchSubjects();
    };

    /* Null-safe: an enrollment whose student or subject row is missing used to
       throw inside this computed and blank the entire table. */
    const filteredEnrollments = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query) return enrollments.value;
      return enrollments.value.filter((enrollment) => {
        const name = enrollment.student ? enrollment.student.name : "";
        const title = enrollment.subject ? enrollment.subject.title : "";
        return `${name} ${title}`.toLowerCase().includes(query);
      });
    });

    const hasEnrollments = computed(() => enrollments.value.length > 0);

    const editEnrollment = (enrollment) => {
      editingEnrollment.value = true;
      form.value.student_id = enrollment.student.id;
      form.value.subject_id = enrollment.subject.id;
      student_name.value = enrollment.student.name;
      subject_title.value = enrollment.subject.title;
      currentEnrollmentId.value = enrollment.id;
      notice.value = "";
    };

    const cancelEdit = () => {
      editingEnrollment.value = false;
      form.value.student_id = "";
      form.value.subject_id = "";
      student_name.value = "";
      subject_title.value = "";
      currentEnrollmentId.value = null;
    };

    const updateEnrollment = async () => {
      actionError.value = "";
      const id = currentEnrollmentId.value;
      try {
        await axios.put(`/teacher/enrollments/${id}`, {
          student_id: form.value.student_id,
          subject_id: form.value.subject_id,
          student_name: student_name.value,
          subject_title: subject_title.value,
        });
        cancelEdit();
        await fetchEnrollments();
        notice.value = "Enrollment updated.";
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't update that enrollment.",
        );
      }
    };

    const askDelete = (enrollment) => {
      enrollmentToDelete.value = enrollment;
      showModal.value = true;
    };

    const cancelDelete = () => {
      showModal.value = false;
      enrollmentToDelete.value = null;
    };

    const confirmDelete = async () => {
      const enrollment = enrollmentToDelete.value;
      showModal.value = false;
      enrollmentToDelete.value = null;
      if (!enrollment) return;
      notice.value = "";
      actionError.value = "";
      try {
        await axios.delete(`/teacher/enrollments/${enrollment.id}`);
        enrollments.value = enrollments.value.filter(
          (e) => e.id !== enrollment.id,
        );
        notice.value = `${enrollment.student.name} was removed from ${enrollment.subject.title}.`;
      } catch (error) {
        actionError.value = apiErrorMessage(
          error,
          "We couldn't delete that enrollment.",
        );
      }
    };

    const updateStudentName = () => {
      const selected = students.value.find(
        (student) => student.id === form.value.student_id,
      );
      student_name.value = selected ? selected.name : "";
    };

    const updateSubjectTitle = () => {
      const selected = subjects.value.find(
        (subject) => subject.id === form.value.subject_id,
      );
      subject_title.value = selected ? selected.title : "";
    };

    onMounted(reload);

    return {
      enrollments,
      searchQuery,
      filteredEnrollments,
      hasEnrollments,
      editEnrollment,
      editingEnrollment,
      form,
      students,
      subjects,
      updateStudentName,
      updateSubjectTitle,
      updateEnrollment,
      cancelEdit,
      loading,
      loadError,
      actionError,
      notice,
      showModal,
      askDelete,
      cancelDelete,
      confirmDelete,
      reload,
      student_name,
      // Read by the `editMessage` / `deleteMessage` computeds below: a computed
      // cannot see a `setup()` ref that is not returned, and the only symptom
      // is a console warning.
      enrollmentToDelete,
    };
  },
  computed: {
    editMessage() {
      const name = this.student_name || "This student";
      return `Moving ${name} to a different subject changes which tasks they see.`;
    },
    deleteMessage() {
      const e = this.enrollmentToDelete;
      if (!e) return "This cannot be undone.";
      return `${e.student.name} will be removed from ${e.subject.title}, and will no longer see its tasks. This cannot be undone.`;
    },
  },
};
</script>

<style scoped>
.enrollment-table {
  min-width: 34rem;
}
</style>
