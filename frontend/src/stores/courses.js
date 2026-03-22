import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCourses,
  getCourseById,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/services/api/courses'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([])
  const currentCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCourses() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await getCourses()
      if (err) throw err
      courses.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchCourses error:', err.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchAdminCourses() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await getAdminCourses()
      if (err) throw err
      courses.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchAdminCourses error:', err.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchCourseById(id) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await getCourseById(id)
      if (err) throw err
      currentCourse.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchCourseById error:', err.message)
    } finally {
      loading.value = false
    }
  }

  async function createCourseAction(courseData) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await createCourse(courseData)
      if (err) throw err
      courses.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('createCourse error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateCourseAction(id, courseData) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await updateCourse(id, courseData)
      if (err) throw err
      const index = courses.value.findIndex((c) => c.id === id)
      if (index !== -1) courses.value[index] = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('updateCourse error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteCourseAction(id) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await deleteCourse(id)
      if (err) throw err
      courses.value = courses.value.filter((c) => c.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteCourse error:', err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    courses,
    currentCourse,
    loading,
    error,
    fetchCourses,
    fetchAdminCourses,
    fetchCourseById,
    createCourse: createCourseAction,
    updateCourse: updateCourseAction,
    deleteCourse: deleteCourseAction,
  }
})
