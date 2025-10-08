<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <h1>ADMIN</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Tên đăng nhập:</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="form.remember" />
            <label for="remember">Ghi nhớ đăng nhập</label>
          </div>
          <a href="#" class="forgot-password">Quên mật khẩu?</a>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading">Đang đăng nhập...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>

      <!-- <div class="demo-credentials">
        <h4>🔑 Tài khoản Demo:</h4>
        <p>Email: <strong>admin@sectest.com</strong></p>
        <p>Mật khẩu: <strong>admin123</strong></p>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi.js'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Validation
const validateForm = () => {
  if (!form.value.username.trim()) {
    error.value = 'Vui lòng nhập tên đăng nhập'
    return false
  }

  if (!form.value.password.trim()) {
    error.value = 'Vui lòng nhập mật khẩu'
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    // Prepare login credentials
    const credentials = {
      username: form.value.username.trim(),
      password: form.value.password.trim(),
    }

    console.log('Admin login credentials:', credentials)

    // Call login API
    const response = await authApi.login(credentials)

    console.log('Admin login response:', response)

    // Handle successful login
    if (response.success && response.data) {
      const { user, accessToken, refreshToken } = response.data

      // Verify admin role
      if (user.role !== 'admin') {
        throw new Error('Bạn không có quyền truy cập trang admin')
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // Store user info
      localStorage.setItem('user', JSON.stringify(user))

      // Store legacy admin session (backward compatibility)
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', user.email)

      loading.value = false
      success.value = 'Đăng nhập thành công!'

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1000)
    } else {
      throw new Error(response.message || 'Đăng nhập không thành công')
    }
  } catch (err) {
    loading.value = false
    console.error('Admin login error:', err)
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      status: err.response?.status,
      data: err.response?.data,
    })

    // Handle different error types
    if (err.response?.status === 401) {
      error.value = 'Tên đăng nhập hoặc mật khẩu không đúng'
    } else if (err.response?.status === 400) {
      error.value = 'Thông tin đăng nhập không hợp lệ'
    } else if (err.response?.status === 500) {
      error.value = 'Lỗi máy chủ, vui lòng thử lại sau'
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      if (err.message.includes('Network Error')) {
        error.value = 'Không thể kết nối tới server. Vui lòng kiểm tra server có đang chạy không.'
      } else {
        error.value = err.message
      }
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!'
    }
  }
}

// Clear error when user starts typing
const clearError = () => {
  error.value = ''
  success.value = ''
}

// Watch form changes to clear errors
import { watch } from 'vue'
watch([() => form.value.username, () => form.value.password], clearError)
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: url('../assets/desktopback.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.admin-icon svg {
  width: 30px;
  height: 30px;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
}

.login-header p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input[type='checkbox'] {
  width: auto;
  margin-right: 8px;
  transform: scale(1.2);
}

.remember-me label {
  color: #5a6c7d;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 0;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fff5f5;
  color: #e53e3e;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fed7d7;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.demo-credentials {
  background: #f0f8ff;
  border: 1px solid #bee3f8;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
}

.demo-credentials h4 {
  color: #2b6cb0;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.demo-credentials p {
  color: #4a5568;
  margin: 5px 0;
  font-size: 14px;
}

.demo-credentials strong {
  color: #2b6cb0;
  background: #e6f3ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.login-footer {
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
  margin-top: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-login {
    padding: 10px;
  }

  .login-container {
    padding: 30px 20px;
    margin: 10px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 25px 15px;
  }

  .login-header h1 {
    font-size: 22px;
    letter-spacing: 1px;
  }

  .admin-icon {
    width: 50px;
    height: 50px;
  }

  .admin-icon svg {
    width: 25px;
    height: 25px;
  }
}
</style>
