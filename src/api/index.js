// API Client Entry Point
// Import all API modules for easy access

import axiosClient from './axiosClient.js'
import authApi from './authApi.js'
import examApi from './examApi.js'
import questionApi from './questionApi.js'

// Export all APIs
export { axiosClient, authApi, examApi, questionApi }

// Default export for convenience
export default {
  client: axiosClient,
  auth: authApi,
  exam: examApi,
  question: questionApi,
}
