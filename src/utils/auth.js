// Authentication utility functions

export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken')
  const user = localStorage.getItem('user')
  return !!(token && user)
}

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

export const getUserRole = () => {
  const user = getUser()
  return user?.role || null
}

export const isUserRole = () => {
  return getUserRole() === 'user'
}

export const isAdminRole = () => {
  return getUserRole() === 'admin'
}

export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export const requireAuth = () => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required')
  }
}

export const requireUserAuth = () => {
  requireAuth()
  if (!isUserRole()) {
    throw new Error('User role required')
  }
}

export const requireAdminAuth = () => {
  requireAuth()
  if (!isAdminRole()) {
    throw new Error('Admin role required')
  }
}

export const performLogout = async () => {
  try {
    // Import authApi dynamically to avoid circular dependency
    const { default: authApi } = await import('@/api/authApi.js')

    // Call logout API
    await authApi.logout()
    console.log('Logout API called successfully')
  } catch (error) {
    console.error('Logout API error:', error)
    // Continue with logout even if API fails
  } finally {
    // Clear authentication data
    clearAuth()
  }
}
