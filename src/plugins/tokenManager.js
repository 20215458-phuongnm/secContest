import tokenManager from '@/utils/tokenManager.js'

export default {
  install(app) {
    // Start token manager when app starts
    const startTokenManager = () => {
      const hasToken = localStorage.getItem('accessToken')
      const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'

      if (hasToken && isLoggedIn) {
        console.log('Starting automatic token refresh...')
        tokenManager.startAutoRefresh()
      }
    }

    // Start immediately
    startTokenManager()

    // Provide tokenManager globally
    app.config.globalProperties.$tokenManager = tokenManager
    app.provide('tokenManager', tokenManager)

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'accessToken') {
        if (e.newValue) {
          // Token was added, start auto refresh
          tokenManager.startAutoRefresh()
        } else {
          // Token was removed, stop auto refresh
          tokenManager.stopAutoRefresh()
        }
      }
    })

    // Stop token manager when page unloads
    window.addEventListener('beforeunload', () => {
      tokenManager.stopAutoRefresh()
    })
  },
}
