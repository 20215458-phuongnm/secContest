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
        

        <div class="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div class="actions-grid">
            <RouterLink to="/admin/upload" class="action-card create-btn">
              <div class="action-icon">
                <span>✏️</span>
              </div>
              <h3>Tạo câu hỏi</h3>
              <p>Tạo câu hỏi trắc nghiệm mới</p>
            </RouterLink>

            <RouterLink to="/admin/questions" class="action-card manage-btn">
              <div class="action-icon">
                <span>📋</span>
              </div>
              <h3>Quản lý câu hỏi</h3>
              <p>Xem danh sách câu hỏi</p>
            </RouterLink>

            <button
              @click="exportRegistrations"
              class="action-card export-btn"
              :disabled="isExporting"
            >
              <div class="action-icon">
                <span v-if="isExporting">⏳</span>
                <span v-else>📊</span>
              </div>
              <h3>{{ isExporting ? 'Đang xuất...' : 'Xuất danh sách thí sinh' }}</h3>
              <p>Tải file Excel danh sách đăng ký</p>
            </button>
          </div>
        </div>
        <img 
  src="https://blndt.s3.ap-southeast-1.amazonaws.com/questions/1760025078335-test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA2AUOOY35E32R24VB%2F20251009%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20251009T155119Z&X-Amz-Expires=3600&X-Amz-Signature=180957fe9763c79a7b2e5fd4e5fb3fe18c5aaaf6419e23d491d1d66fba68743c&X-Amz-SignedHeaders=host" 
  alt="Question image" 
  style="max-width: 100%; height: auto;"
/>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { performLogout } from '@/utils/auth.js'
import authApi from '@/api/authApi.js'
import TokenStatus from '@/components/TokenStatus.vue'

const router = useRouter()

const adminEmail = ref('')
const isDevelopment = ref(process.env.NODE_ENV === 'development')
const stats = ref({
  totalQuestions: 1247,
  totalCategories: 8,
  totalUsers: 324,
  testsToday: 45,
})
const isExporting = ref(false)

const exportRegistrations = async () => {
  isExporting.value = true
  try {
    // Check if we have a valid token
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      router.push('/admin')
      return
    }

    console.log('Exporting with token:', token ? 'Token exists' : 'No token')
    const response = await authApi.exportRegistrationsExcel()

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
    link.setAttribute('download', `danh-sach-thi-sinh-${dateStr}.xlsx`)

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    console.log('Export successful')
  } catch (error) {
    console.error('Export failed:', error)

    // Handle specific authentication errors
    if (error.response?.status === 401) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('adminLoggedIn')
      router.push('/admin')
    } else if (error.response?.status === 403) {
      alert('Bạn không có quyền truy cập chức năng này.')
    } else {
      alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.')
    }
  } finally {
    isExporting.value = false
  }
}

const logout = async () => {
  // Call logout API and clear auth
  await performLogout()

  // Clear old admin session data (backward compatibility)
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')

  // Redirect to admin login
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
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.action-icon span {
  display: inline-block;
  animation: pulse 2s infinite;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  text-align: center;
}

.action-card p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.875rem;
  text-align: center;
}

/* Create Button Styles - Blue */
.create-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  color: white !important;
  border: none;
}

.create-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.create-btn h3 {
  color: white !important;
}

.create-btn p {
  color: rgba(255, 255, 255, 0.9) !important;
  opacity: 1 !important;
}

/* Manage Button Styles - Purple */
.manage-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
  color: white !important;
  border: none;
}

.manage-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.manage-btn h3 {
  color: white !important;
}

.manage-btn p {
  color: rgba(255, 255, 255, 0.9) !important;
  opacity: 1 !important;
}

/* Export Button Styles - Green */
.export-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.export-btn:disabled {
  background: #9ca3af !important;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-btn h3 {
  color: white !important;
}

.export-btn p {
  color: rgba(255, 255, 255, 0.9) !important;
  opacity: 1 !important;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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
