import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useQuizStore = defineStore('quiz', () => {
  // ─────────────────────────────────────────
  // Estado
  // ─────────────────────────────────────────

  // Preguntas del quiz actual con sus opciones
  const questions = ref([])

  // Resultados previos del usuario en este quiz
  const results = ref([])

  const loading = ref(false)
  const error = ref(null)

  // ─────────────────────────────────────────
  // Acciones
  // ─────────────────────────────────────────

  // Carga las preguntas de un quiz con sus opciones
  async function fetchQuestions(lessonId) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('quiz_questions')
        .select('*, quiz_options (*)')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true })

      if (err) throw err

      // Ordena las opciones de cada pregunta por position
      questions.value = data.map((q) => ({
        ...q,
        quiz_options: (q.quiz_options || []).sort((a, b) => a.position - b.position),
      }))
    } catch (err) {
      error.value = err.message
      console.error('fetchQuestions error:', err.message)
    } finally {
      loading.value = false
    }
  }

  // Crea una nueva pregunta con sus opciones
  async function createQuestion(lessonId, questionData) {
    loading.value = true
    error.value = null

    try {
      const position = questions.value.length

      // Inserta la pregunta
      const { data: question, error: qErr } = await supabase
        .from('quiz_questions')
        .insert({
          lesson_id: lessonId,
          question: questionData.question,
          type: questionData.type,
          position,
        })
        .select()
        .single()

      if (qErr) throw qErr

      // Inserta las opciones si aplica
      if (questionData.options && questionData.options.length > 0) {
        const optionsToInsert = questionData.options.map((opt, i) => ({
          question_id: question.id,
          text: opt.text,
          is_correct: opt.is_correct,
          position: i,
        }))

        const { data: options, error: oErr } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert)
          .select()

        if (oErr) throw oErr
        question.quiz_options = options
      } else {
        question.quiz_options = []
      }

      questions.value.push(question)
      return question
    } catch (err) {
      error.value = err.message
      console.error('createQuestion error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Elimina una pregunta
  async function deleteQuestion(questionId) {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase.from('quiz_questions').delete().eq('id', questionId)

      if (err) throw err
      questions.value = questions.value.filter((q) => q.id !== questionId)
      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteQuestion error:', err.message)
      return false
    } finally {
      loading.value = false
    }
  }

  // Guarda el resultado del estudiante
  async function saveResult(userId, lessonId, score, total, answers) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          score,
          total,
          answers,
        })
        .select()
        .single()

      if (err) throw err
      results.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('saveResult error:', err.message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Carga el historial de resultados del usuario en un quiz
  async function fetchResults(userId, lessonId) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false })

      if (err) throw err
      results.value = data
    } catch (err) {
      error.value = err.message
      console.error('fetchResults error:', err.message)
    } finally {
      loading.value = false
    }
  }

  return {
    questions,
    results,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    deleteQuestion,
    saveResult,
    fetchResults,
  }
})
