import axiosClient from './axiosClient.js'

const examApi = {
  // Start new exam
  startExam: () => {
    return axiosClient.post('/exam/start')
  },

  // Submit exam with answers
  submitExam: (examData) => {
    return axiosClient.post('/exam/submit', examData)
  },
}

export default examApi
