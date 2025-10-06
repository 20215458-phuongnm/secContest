<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div class="header-right">
          <div class="admin-info">
            <span class="admin-email">{{ adminEmail }}</span>
            <button @click="logout" class="logout-btn">Đăng xuất</button>
          </div>
        </div>
      </div>
    </header>

    <nav class="dashboard-nav">
      <div class="nav-container">
        <RouterLink to="/admin/dashboard" class="nav-item active">
          <span class="nav-icon"></span>
          Dashboard
        </RouterLink>
        <RouterLink to="/admin/questions" class="nav-item">
          <span class="nav-icon"></span>
          Quản lý câu hỏi
        </RouterLink>
        <RouterLink to="/admin/upload" class="nav-item">
          <span class="nav-icon"></span>
          Tạo câu hỏi
        </RouterLink>
      </div>
    </nav>

    <main class="dashboard-main">
      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">❓</div>
            <div class="stat-info">
              <h3>{{ stats.totalQuestions }}</h3>
              <p>Tổng câu hỏi</p>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div class="actions-grid">
            <RouterLink to="/admin/upload" class="action-card ">
              <h3>Tạo câu hỏi</h3>
              <p>Tạo câu hỏi trắc nghiệm mới</p>
            </RouterLink>

            <RouterLink to="/admin/questions" class="action-card">
              <h3>Quản lý câu hỏi</h3>
              <p>Xem danh sách câu hỏi</p>
            </RouterLink>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const adminEmail = ref('')
const stats = ref({
  totalQuestions: 1247,
  totalCategories: 8,
  totalUsers: 324,
  testsToday: 45,
})

const logout = () => {
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')
  router.push('/admin')
}

onMounted(() => {
  // Check if admin is logged in
  if (!localStorage.getItem('adminLoggedIn')) {
    router.push('/admin')
    return
  }

  adminEmail.value = localStorage.getItem('adminEmail') || 'admin@sectest.com'
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  color: #1a202c;
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
}

.header-left p {
  color: #718096;
  margin: 0.25rem 0 0 0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-email {
  color: #4a5568;
  font-weight: 500;
}

.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c53030;
}

.dashboard-nav {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  gap: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #667eea;
  background: #f7fafc;
}

.nav-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.nav-icon {
  font-size: 1.125rem;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f8ff;
  border-radius: 12px;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.stat-info p {
  color: #718096;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

.quick-actions,
.recent-activity {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.quick-actions h2,
.recent-activity h2 {
  color: #1a202c;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-card.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.action-card p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.875rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.activity-info p {
  margin: 0 0 0.25rem 0;
  color: #1a202c;
}

.activity-time {
  color: #718096;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .nav-container {
    flex-direction: column;
    padding: 0;
  }

  .nav-item {
    border-bottom: 1px solid #e2e8f0;
    border-left: 3px solid transparent;
  }

  .nav-item.active {
    border-left-color: #667eea;
    border-bottom-color: transparent;
  }

  .dashboard-main {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
