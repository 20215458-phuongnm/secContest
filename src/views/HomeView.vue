<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form data
const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

// Handle login
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  // Simulate login process
  setTimeout(() => {
    // Demo credentials - in real app this would be API call
    if (form.value.email === 'student@sectest.com' && form.value.password === 'student123') {
      // Store student session
      localStorage.setItem('studentLoggedIn', 'true')
      localStorage.setItem('studentEmail', form.value.email)

      // Redirect to quiz page
      router.push('/quiz')
    } else {
      error.value = 'Email hoặc mật khẩu không đúng!'
    }
    loading.value = false
  }, 1500)
}
</script>

<template>
  <div class="student-login">
    <div class="login-container">
      <div class="login-form">
        <h1 class="login-title">ĐĂNG NHẬP</h1>
        <div class="title-underline"></div>
        <!-- 
        <div class="demo-info">
          <strong>🎓 Demo - Tài khoản thí sinh:</strong>
          Email: student@sectest.com<br />
          Mật khẩu: student123
        </div> -->

        <form @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              :class="{ error: error }"
              placeholder="Your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu:</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form-input"
              :class="{ error: error }"
              placeholder="Your password"
            />
          </div>

          <div class="form-links">
            <RouterLink to="/register" class="link">Đăng ký ngay!</RouterLink>
            <a href="#" class="link" @click.prevent>Quên mật khẩu?</a>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading">Đang đăng nhập...</span>
            <span v-else>Đăng nhập</span>
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-login {
  min-height: 100vh;
  background: url('../assets/desktopback.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.login-title {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  margin: 0 auto 2.5rem auto;
  border-radius: 2px;
}

.form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.link {
  color: #667eea;
  text-decoration: underline;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.link:hover {
  color: #5a67d8;
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
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #e53e3e;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(229, 62, 62, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(229, 62, 62, 0.2);
}

.admin-link-container {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.admin-access {
  color: #718096;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.admin-access:hover {
  color: #4a5568;
}

/* Demo credentials info */
.demo-info {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: #065f46;
}

.demo-info strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #047857;
}

@media (max-width: 640px) {
  .student-login {
    padding: 1rem;
  }

  .login-form {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .form-links {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
@media (max-width: 640px) {
  .student-login {
    padding: 1rem;
  }

  .login-form {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .form-links {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
