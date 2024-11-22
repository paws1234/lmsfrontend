import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeComponent.vue";
import Login from "../views/LoginComponent.vue";
import Register from "../views/RegisterComponent.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import StudentList from "../views/admin/StudentList.vue";
import StudentForm from "../views/admin/StudentForm.vue";
import AdminLayout from "../views/admin/AdminLayout.vue";
import TeacherList from "../views/admin/TeacherList.vue";
import TeacherForm from "../views/admin/TeacherForm.vue";
import TeacherUpdate from "../views/admin/TeacherUpdate.vue";
import CourseList from "../views/admin/CourseList.vue";
import CourseCreate from "../views/admin/CourseCreate.vue";
import CourseEdit from "../views/admin/CourseEdit.vue";
import ScheduleManager from "../views/admin/ScheduleManager.vue";
import EventHandlerManager from "../views/admin/EventHandlerManager.vue";
import TeacherDashboard from "../views/teacher/TeacherDashboard.vue";
import TeacherLayout from "../views/teacher/TeacherLayout.vue";
import SubjectList from "../views/teacher/SubjectList.vue";
import SubjectCreate from "../views/teacher/SubjectCreate.vue";
import SubjectEdit from "../views/teacher/SubjectEdit.vue";
import StudentDashboard from "../views/student/StudentDashboard.vue";
import EnrollmentForm from "../views/teacher/EnrollmentForm.vue";
import EnrollmentList from "../views/teacher/EnrollmentList.vue";
import TodoList from "../views/teacher/TodoList.vue";
import TodoCreate from "../views/teacher/TodoCreate.vue";
import TodoEdit from "../views/teacher/TodoEdit.vue";
import QuestionForm from '../views/teacher/QuestionForm.vue';
import QuestionList from '../views/teacher/QuestionList.vue';
import StudentLayout from "../views/student/StudentLayout.vue";
import StudentTasks from '../views/student/StudentTasks.vue'; // Import Tasks component
import StudentScores from '../views/student/StudentScores.vue'; // Import Scores component
import StudentLists from '../views/student/StudentList.vue'; // Import Scores component

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },

  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "dashboard", name: "AdminDashboard", component: AdminDashboard },
      { path: "students", name: "StudentList", component: StudentList },
      {
        path: "students/create",
        name: "StudentCreate",
        component: StudentForm,
      },
      { path: "students/:id", name: "StudentShow", component: StudentForm },
      {
        path: "students/:id/edit",
        name: "StudentEdit",
        component: StudentForm,
      },

      { path: "teachers", name: "TeacherList", component: TeacherList },
      {
        path: "teachers/create",
        name: "TeacherCreate",
        component: TeacherForm,
      },
      { path: "teachers/:id", name: "TeacherShow", component: TeacherUpdate },
      {
        path: "teachers/:id/edit",
        name: "TeacherEdit",
        component: TeacherForm,
      },

      { path: "courses", name: "CourseList", component: CourseList },
      { path: "courses/create", name: "CourseCreate", component: CourseCreate },
      { path: "courses/:id/edit", name: "CourseEdit", component: CourseEdit },

      {
        path: "schedules",
        name: "ScheduleManager",
        component: ScheduleManager,
      },
      {
        path: "event-handlers",
        name: "EventHandlerManager",
        component: EventHandlerManager,
      },
    ],
  },

  {
    path: "/teacher",
    component: TeacherLayout,
    children: [
      {
        path: "dashboard",
        name: "TeacherDashboard",
        component: TeacherDashboard,
      },
      { path: "subjects", name: "SubjectList", component: SubjectList },
      {
        path: "subjects/create",
        name: "SubjectCreate",
        component: SubjectCreate,
      },
      {
        path: "subjects/:id/edit",
        name: "SubjectEdit",
        component: SubjectEdit,
        props: true,
      },

      {
        path: "enrollments",
        name: "EnrollmentList",
        component: EnrollmentList,
      },
      {
        path: "enrollments/create",
        name: "EnrollmentCreate",
        component: EnrollmentForm,
      },

      { path: "todos", name: "TodoList", component: TodoList },
      { path: "todos/create", name: "TodoCreate", component: TodoCreate },
      {
        path: "todos/:id/edit",
        name: "TodoEdit",
        component: TodoEdit,
        props: true,
      },
      {
        path: "questions/create",
        name: "QuestionCreate",
        component: QuestionForm,
      },
      {
        path: "questions/list",
        name: "QuestionList",
        component: QuestionList,
      },

    ],
  },

  {
    path: '/student',
    component: StudentLayout,
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: StudentDashboard,
      },
      {
        path: 'tasks',  // Path for the Tasks view
        name: 'StudentTasks',
        component: StudentTasks,  // Import and assign Tasks component
      },
      {
        path: 'scores', // Path for the Scores view
        name: 'StudentScores',
        component: StudentScores, // Import and assign Scores component
      },
      {
        path: 'studentlists', // Path for the Scores view
        name: 'StudentListS',
        component: StudentLists, // Import and assign Scores component
      },
    ],
  },
  
 
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
