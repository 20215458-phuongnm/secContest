import axiosClient from './axiosClient.js'

const authApi = {
  // Admin login
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials)
  },

  // Admin logout
  logout: () => {
    return axiosClient.post('/auth/logout')
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/refresh', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  },

  // Create admin user
  createAdmin: (adminData) => {
    return axiosClient.post('/auth/create-admin', adminData)
  },

  // User registration
  register: (registrationData) => {
    return axiosClient.post('/registration', registrationData)
  },
}

export default authApi
