import axiosClient from './axiosClient.js'

const examApi = {
  // Start new exam
  startExam: () => {
    return axiosClient.post('/exam/start')
  },

  // Get exam questions
  getExamQuestions: () => {
    return axiosClient.get('/exam/questions')
  },

  // Submit answer for a question
  submitAnswer: (answerData) => {
    return axiosClient.post('/exam/answer', answerData)
  },

  // Finish exam
  finishExam: () => {
    return axiosClient.post('/exam/finish')
  },

  // Get exam results
  getExamResults: (examId) => {
    return axiosClient.get(`/exam/results/${examId}`)
  },

  // Get exam history
  getExamHistory: () => {
    return axiosClient.get('/exam/history')
  },

  // Get current exam status
  getExamStatus: () => {
    return axiosClient.get('/exam/status')
  },

  // Pause exam
  pauseExam: () => {
    return axiosClient.post('/exam/pause')
  },

  // Resume exam
  resumeExam: () => {
    return axiosClient.post('/exam/resume')
  },

  // Get exam statistics
  getExamStats: () => {
    return axiosClient.get('/exam/stats')
  },
}

export default examApi
