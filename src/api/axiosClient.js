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
    // Skip adding token for login and registration endpoints
    const skipAuthEndpoints = ['/auth/login', '/registration']
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

// Response interceptor - Handle responses and errors
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          break
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
