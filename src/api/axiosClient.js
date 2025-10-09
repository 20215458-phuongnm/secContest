import axios from 'axios'

// Base URL configuration
const BASE_URL = 'http://localhost:3000'

// Create axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    // Skip adding token for login, registration, and refresh endpoints
    const skipAuthEndpoints = ['/auth/login', '/registration', '/auth/refresh']
    const isSkipAuth = skipAuthEndpoints.some((endpoint) => config.url?.includes(endpoint))

    console.log('Request config:', {
      url: config.url,
      method: config.method,
      data: config.data,
      isSkipAuth,
    })

    if (!isSkipAuth) {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - Handle responses and errors, with auto-refresh
import tokenManager from '@/utils/tokenManager.js'
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Try to refresh token
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true
        try {
          const newToken = await tokenManager.refreshToken()
          processQueue(null, newToken)
          isRefreshing = false
          // Update header and retry original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return axiosClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          isRefreshing = false
          // Clear tokens and redirect to login
          tokenManager.clearTokens()
          return Promise.reject(refreshError)
        }
      } else {
        // Queue requests while refreshing
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }
    }
    // Other errors
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 403:
          console.error('Forbidden access')
          break
        case 500:
          console.error('Internal server error')
          break
        default:
          console.error('API Error:', data?.message || error.message)
      }
      return Promise.reject(data || error.message)
    } else if (error.request) {
      console.error('Network error:', error.request)
      return Promise.reject('Network error - please check your connection')
    } else {
      console.error('Error:', error.message)
      return Promise.reject(error.message)
    }
  },
)

export default axiosClient
