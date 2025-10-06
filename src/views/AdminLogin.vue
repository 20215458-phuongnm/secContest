<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <div class="admin-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L9 7V9C9 10 8 11 7 11V13C8 13 9 14 9 15V16L12 18L15 16V15C15 14 16 13 17 13V11C16 11 15 10 15 9ZM12 8C14.2 8 16 9.8 16 12S14.2 16 12 16S8 14.2 8 12S9.8 8 12 8Z"
            />
          </svg>
        </div>
        <h1>ADMIN PANEL</h1>
        <p>Đăng nhập hệ thống quản trị</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Nhập địa chỉ email"
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

      <div class="login-footer">
        <p>© 2025 Admin Panel - Bảo mật & Tin cậy</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const loading = ref(false)
const error = ref('')

// Fake admin account
const ADMIN_CREDENTIALS = {
  email: 'admin@sectest.com',
  password: 'admin123',
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  // Simulate login process
  setTimeout(() => {
    if (
      form.value.email === ADMIN_CREDENTIALS.email &&
      form.value.password === ADMIN_CREDENTIALS.password
    ) {
      // Store admin session
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', form.value.email)

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } else {
      error.value = 'Email hoặc mật khẩu không đúng!'
    }
    loading.value = false
  }, 1500)
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background:
    url('../assets/desktopback.png');
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
