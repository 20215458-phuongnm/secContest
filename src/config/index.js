// Environment configuration
export const config = {
  // API Base URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // Environment info
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',

  // Debug info (only show in development)
  debug: {
    showTokenStatus: import.meta.env.MODE === 'development',
    enableConsoleLog: import.meta.env.MODE === 'development',
  },
}

// Log environment info in development
if (config.isDevelopment) {
  console.log('🔧 Environment Config:', {
    mode: import.meta.env.MODE,
    apiBaseUrl: config.apiBaseUrl,
    env: import.meta.env,
  })
}

export default config
