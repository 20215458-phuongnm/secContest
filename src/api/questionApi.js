import axiosClient from './axiosClient.js'

const questionApi = {
  // Get all questions - active only by default
  getQuestions: (params = {}) => {
    return axiosClient.get('/questions', { params })
  },

  // Get all questions including inactive ones
  getAllQuestions: (includeInactive = true) => {
    return axiosClient.get('/questions', {
      params: { includeInactive },
    })
  },

  // Get question by ID
  getQuestionById: (id) => {
    return axiosClient.get(`/questions/${id}`)
  },

  // Get random active questions
  getRandomActiveQuestions: (count) => {
    const params = count ? { count } : {}
    return axiosClient.get('/questions/random/active', { params })
  },

  // Create new question
  createQuestion: (questionData) => {
    return axiosClient.post('/questions', questionData)
  },

  // Update question (full update)
  updateQuestion: (id, questionData) => {
    return axiosClient.put(`/questions/${id}`, questionData)
  },

  // Partial update question
  patchQuestion: (id, questionData) => {
    return axiosClient.patch(`/questions/${id}`, questionData)
  },

  // Delete question
  deleteQuestion: (id) => {
    return axiosClient.delete(`/questions/${id}`)
  },

  // Toggle question active status
  toggleQuestionStatus: (id) => {
    return axiosClient.patch(`/questions/${id}/toggle-status`)
  },

  // Bulk delete questions
  bulkDeleteQuestions: (ids) => {
    return axiosClient.delete('/questions/bulk', { data: { ids } })
  },

  // Search questions by content
  searchQuestions: (searchTerm) => {
    return axiosClient.get(`/questions/search?q=${encodeURIComponent(searchTerm)}`)
  },

  // Get questions by category
  getQuestionsByCategory: (category) => {
    return axiosClient.get(`/questions/category/${category}`)
  },

  // Upload question image
  uploadQuestionImage: (imageFile) => {
    const formData = new FormData()
    formData.append('file', imageFile) // Changed from 'image' to 'file' to match API

    return axiosClient.post('/questions/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Import questions from file
  importQuestions: (file) => {
    const formData = new FormData()
    formData.append('file', file)

    return axiosClient.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Export questions to file
  exportQuestions: (format = 'json') => {
    return axiosClient.get(`/questions/export?format=${format}`, {
      responseType: 'blob',
    })
  },

  // Get question statistics
  getQuestionStats: () => {
    return axiosClient.get('/questions/stats')
  },

  // Duplicate question
  duplicateQuestion: (id) => {
    return axiosClient.post(`/questions/${id}/duplicate`)
  },
}

export default questionApi
