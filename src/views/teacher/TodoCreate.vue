<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Create TODO</h2>
    <form @submit.prevent="createTodo">
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Subject</label>
        <select v-model="todo.subject" class="p-2 border border-gray-300 rounded-md w-full">
          <option disabled value="">Select a subject</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.title }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Type</label>
        <select v-model="todo.type" class="p-2 border border-gray-300 rounded-md w-full">
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Title</label>
        <input v-model="todo.title" type="text" placeholder="Enter title"
          class="p-2 border border-gray-300 rounded-md w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-2 text-gray-700">Description</label>
        <textarea v-model="todo.description" placeholder="Enter description"
          class="p-2 border border-gray-300 rounded-md w-full"></textarea>
      </div>
      <div class="mb-4">
        <input type="file" class="p-2 border border-gray-300 rounded-md" @change="handleFileUpload" />
      </div>
      <button type="submit"
        class="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-300">
        Save TODO
      </button>
    </form>
  </div>
</template>
<script>
import axios from "@/axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
const BASE_CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djwydarmv';
const UPLOAD_PRESET = 'pawscloudinary';
export default {
  setup() {
    const router = useRouter();
    const todo = ref({
      subject: '',
      type: 'personal',
      title: '',
      description: '',
      file: null,
      fileUrl: ''
    });
    const subjects = ref([]);
    const getResourceType = (file) => {
      const fileType = file.type;
      if (fileType.startsWith('image/')) {
        return 'image';
      } else if (fileType.startsWith('video/')) {
        return 'video';
      } else {
        return 'raw';
      }
    };
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        todo.value.file = file;
        try {
          const resourceType = getResourceType(file);
          const cloudinaryUrl = `${BASE_CLOUDINARY_URL}/${resourceType}/upload`;
          const url = await uploadToCloudinary(file, cloudinaryUrl);
          todo.value.fileUrl = url;
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    const uploadToCloudinary = async (file, cloudinaryUrl) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Failed to upload ${file.type}`);
      }
      const data = await response.json();
      return data.secure_url;
    };
    const createTodo = async () => {
      try {
        const formData = new FormData();
        formData.append('subject_id', todo.value.subject);
        formData.append('type', todo.value.type);
        formData.append('title', todo.value.title);
        formData.append('description', todo.value.description);
        if (todo.value.fileUrl) {
          formData.append('fileUrl', todo.value.fileUrl);
        }
        const response = await axios.post('/teacher/todos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Todo created successfully:', response.data);
        router.push('/teacher/todos');
      } catch (error) {
        console.error(
          'Error creating todo:',
          error.response ? error.response.data : error.message,
        );
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        }
      }
    };
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/teacher/getSubjects');
        subjects.value = response.data;
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
    return {
      todo,
      subjects,
      handleFileUpload,
      createTodo,
    };
  },
};
</script>
<style scoped></style>
