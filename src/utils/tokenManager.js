import authApi from '@/api/authApi.js'

class TokenManager {
  constructor() {
    this.refreshTimer = null
    this.isRefreshing = false
    this.REFRESH_THRESHOLD = 2 * 60 * 1000 // Refresh 2 minutes before expiration
    this.CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds
  }

  // Decode JWT token to get expiration time
  decodeToken(token) {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (e) {
      console.error('Error decoding token:', e)
      return null
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    const payload = this.decodeToken(token)
    if (!payload) return true

    const now = Math.floor(Date.now() / 1000)
    return payload.exp && payload.exp <= now
  }

  // Check if token needs refresh (within threshold time)
  shouldRefreshToken(token) {
    const payload = this.decodeToken(token)
    if (!payload) return false

    const now = Date.now()
    const expTime = payload.exp * 1000 // Convert to milliseconds
    const timeUntilExpiry = expTime - now

    return timeUntilExpiry <= this.REFRESH_THRESHOLD
  }

  // Refresh access token
  async refreshToken() {
    if (this.isRefreshing) {
      console.log('Token refresh already in progress')
      return null
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      console.error('No refresh token available')
      this.stopAutoRefresh()
      return null
    }

    // Check if refresh token is expired
    if (this.isTokenExpired(refreshToken)) {
      console.error('Refresh token is expired')
      this.clearTokens()
      this.stopAutoRefresh()
      return null
    }

    this.isRefreshing = true

    try {
      console.log('Refreshing access token...')
      const response = await authApi.refreshToken(refreshToken)

      if (response.success && response.data?.accessToken) {
        // Update tokens in localStorage
        localStorage.setItem('accessToken', response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }

        console.log('Token refreshed successfully')
        return response.data.accessToken
      } else {
        throw new Error('Invalid refresh response')
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      this.clearTokens()
      this.stopAutoRefresh()
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
  }

  // Check tokens and refresh if needed
  async checkAndRefreshToken() {
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      console.log('No access token found')
      this.stopAutoRefresh()
      return false
    }

    // If token is already expired, try to refresh immediately
    if (this.isTokenExpired(accessToken)) {
      console.log('Access token is expired, refreshing...')
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('Failed to refresh expired token:', error)
        return false
      }
    }

    // If token will expire soon, refresh it
    if (this.shouldRefreshToken(accessToken)) {
      console.log('Access token will expire soon, refreshing...')
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('Failed to refresh token:', error)
        return false
      }
    }

    return true
  }

  // Start automatic token refresh checking
  startAutoRefresh() {
    console.log('Starting automatic token refresh')

    // Check immediately
    this.checkAndRefreshToken()

    // Set up periodic checking
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken()
    }, this.CHECK_INTERVAL)
  }

  // Stop automatic token refresh
  stopAutoRefresh() {
    console.log('Stopping automatic token refresh')
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Get time until token expires (in milliseconds)
  getTimeUntilExpiry(token) {
    const payload = this.decodeToken(token)
    if (!payload) return 0

    const now = Date.now()
    const expTime = payload.exp * 1000
    return Math.max(0, expTime - now)
  }

  // Get formatted time until expiry
  getFormattedTimeUntilExpiry(token) {
    const timeMs = this.getTimeUntilExpiry(token)
    const minutes = Math.floor(timeMs / (1000 * 60))
    const seconds = Math.floor((timeMs % (1000 * 60)) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

// Create singleton instance
const tokenManager = new TokenManager()

export default tokenManager

// Export individual functions for backward compatibility
export const isTokenExpired = (token) => tokenManager.isTokenExpired(token)
export const refreshAccessToken = () => tokenManager.refreshToken()
