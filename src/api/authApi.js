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
    return axiosClient.post(
      '/auth/refresh',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )
  },

  // Create admin user
  createAdmin: (adminData) => {
    return axiosClient.post('/auth/create-admin', adminData)
  },

  // User registration
  register: (registrationData) => {
    return axiosClient.post('/registration', registrationData)
  },

  // Export registrations to Excel
  exportRegistrationsExcel: () => {
    const token = localStorage.getItem('accessToken')
    return axiosClient.get('/registration/export/excel', {
      responseType: 'blob', // Important for file downloads
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  },

  // Select exam slot
  selectExamSlot: (examSlotData) => {
    return axiosClient.post('/registration/select-exam-slot', examSlotData)
  },
}

export default authApi
