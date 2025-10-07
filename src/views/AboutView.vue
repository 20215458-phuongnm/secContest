<template>
  <div class="about">
    <nav class="navigation">
      <div class="nav-brand">
        <h2>SecTest</h2>
      </div>
      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Trang chủ</RouterLink>
        <RouterLink to="/about" class="nav-link">Về chúng tôi</RouterLink>
        <RouterLink to="/admin" class="admin-link">Admin Panel</RouterLink>
      </div>
    </nav>

    <main class="main-content">
      <div class="content">
        <h1>Về SecTest</h1>
        <p>
          SecTest là hệ thống quản lý bảo mật và kiểm thử ứng dụng, giúp các tổ chức đảm bảo tính
          bảo mật cho hệ thống của mình.
        </p>
        <div class="features">
          <div class="feature">
            <h3>🔒 Bảo mật cao</h3>
            <p>Hệ thống được thiết kế với các tiêu chuẩn bảo mật cao nhất</p>
          </div>
          <div class="feature">
            <h3>⚡ Hiệu suất tối ưu</h3>
            <p>Tối ưu hóa hiệu suất cho trải nghiệm người dùng tốt nhất</p>
          </div>
          <div class="feature">
            <h3>📊 Quản lý dễ dàng</h3>
            <p>Giao diện quản trị trực quan và dễ sử dụng</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { requireUserAuth, getUser } from '@/utils/auth.js'

const router = useRouter()

// Check authentication on component mount
onMounted(() => {
  try {
    requireUserAuth()
    console.log('User authenticated for about page:', getUser())
  } catch (error) {
    console.error('Authentication failed:', error)
    router.push('/')
  }
})
</script>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand h2 {
  color: #2c3e50;
  font-weight: 700;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #667eea;
}

.nav-link.router-link-exact-active {
  background: #667eea;
  color: white;
}

.admin-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.main-content {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
}

.content > p {
  font-size: 1.2rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature p {
  color: #7f8c8d;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .content h1 {
    font-size: 2rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
