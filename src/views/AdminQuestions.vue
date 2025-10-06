<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Quản Lý Câu Hỏi</h1>
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
        <RouterLink to="/admin/dashboard" class="nav-item">
          <span class="nav-icon"></span>
          Dashboard
        </RouterLink>
        <RouterLink to="/admin/questions" class="nav-item active">
          <span class="nav-icon"></span>
          Quản lý câu hỏi
        </RouterLink>
        <RouterLink to="/admin/upload" class="nav-item">
          <span class="nav-icon"></span>
          Upload câu hỏi
        </RouterLink>
      </div>
    </nav>

    <main class="dashboard-main">
      <div class="questions-container">
        <!-- Header Actions -->
        <div class="page-header">
          <div class="header-actions">
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                class="search-input"
              />
            </div>

            <RouterLink to="/admin/upload" class="add-question-btn"> Thêm câu hỏi </RouterLink>
          </div>
        </div>

        <!-- Questions List -->
        <div class="questions-list">
          <div class="list-header">
            <h3>Danh sách câu hỏi ({{ filteredQuestions.length }})</h3>
          </div>

          <div class="questions-table">
            <div class="table-header">
              <div class="col-id">#</div>
              <div class="col-content">Nội dung</div>
              <div class="col-actions">Thao tác</div>
            </div>

            <div v-for="question in paginatedQuestions" :key="question.id" class="table-row">
              <div class="col-id">{{ question.id }}</div>
              <div class="col-content">
                <div class="question-preview">
                  <p>{{ question.content }}</p>
                  <div v-if="question.hasImage" class="has-image-indicator">🖼️</div>
                </div>
              </div>
              <div class="col-actions">
                <button @click="editQuestion(question)" class="action-btn edit-btn">Sửa</button>
                <button @click="deleteQuestion(question.id)" class="action-btn delete-btn">
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button @click="currentPage--" :disabled="currentPage <= 1" class="page-btn">
              ◀ Trước
            </button>
            <span class="page-info"> Trang {{ currentPage }} / {{ totalPages }} </span>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="page-btn">
              Sau ▶
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Chỉnh sửa câu hỏi #{{ editingQuestion.id }}</h3>
            <button @click="closeEditModal" class="close-btn">❌</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Nội dung câu hỏi</label>
              <textarea v-model="editingQuestion.content" rows="3"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditModal" class="cancel-btn">Hủy</button>
            <button @click="saveQuestion" class="save-btn">💾 Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const adminEmail = ref('')

// Search and filter
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Edit modal
const showEditModal = ref(false)
const editingQuestion = ref({})

// Questions data về đầu tư, kinh tế, tài chính
const questions = ref([
  {
    id: 1,
    content: 'Thời gian nắm giữ vốn đối với quyết định đầu tư dài hạn như thế nào?',
    category: 'Tài chính',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-01',
  },
  {
    id: 2,
    content: 'Yếu tố nào ảnh hưởng đến giá trị thị trường và việc đầu tư doanh nghiệp hiện tại?',
    category: 'Kinh tế',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-02',
  },
  {
    id: 3,
    content: 'Lạm phát ảnh hưởng như thế nào đến sức mua của đồng tiền?',
    category: 'Kinh tế',
    difficulty: 'Dễ',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-03',
  },
  {
    id: 4,
    content: 'Đặc điểm của thị trường tài chính hiệu quả là gì?',
    category: 'Tài chính',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-04',
  },
  {
    id: 5,
    content: 'Nguyên tắc đa dạng hóa trong đầu tư giúp giảm rủi ro như thế nào?',
    category: 'Đầu tư',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-05',
  },
  {
    id: 6,
    content: 'Tỷ lệ P/E (Price/Earnings) trong phân tích cổ phiếu có ý nghĩa gì?',
    category: 'Đầu tư',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-06',
  },
  {
    id: 7,
    content: 'GDP (Tổng sản phẩm quốc nội) được tính theo phương pháp nào?',
    category: 'Kinh tế',
    difficulty: 'Trung bình',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-07',
  },
  {
    id: 8,
    content: 'Lãi suất thực và lãi suất danh nghĩa khác nhau như thế nào?',
    category: 'Tài chính',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-08',
  },
  {
    id: 9,
    content: 'Phân tích SWOT trong đầu tư và kinh doanh bao gồm những yếu tố nào?',
    category: 'Kinh doanh',
    difficulty: 'Dễ',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-09',
  },
  {
    id: 10,
    content: 'Đặc điểm của thị trường gấu (Bear Market) trong chứng khoán là gì?',
    category: 'Đầu tư',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-10',
  },
  {
    id: 11,
    content: 'Ngân hàng trung ương sử dụng công cụ nào để điều tiết lạm phát?',
    category: 'Kinh tế',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-11',
  },
  {
    id: 12,
    content: 'Phương pháp DCF (Discounted Cash Flow) được sử dụng để làm gì?',
    category: 'Tài chính',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-12',
  },
  {
    id: 13,
    content: 'Cung và cầu trong thị trường tự do được điều tiết bởi cơ chế nào?',
    category: 'Kinh tế',
    difficulty: 'Dễ',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-13',
  },
  {
    id: 14,
    content: 'ROI (Return on Investment) được tính như thế nào?',
    category: 'Đầu tư',
    difficulty: 'Dễ',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-14',
  },
  {
    id: 15,
    content: 'Khái niệm "rủi ro hệ thống" trong đầu tư có nghĩa gì?',
    category: 'Đầu tư',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-15',
  },
  {
    id: 16,
    content: 'Tỷ giá hối đoái ảnh hưởng như thế nào đến xuất nhập khẩu?',
    category: 'Kinh tế',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-16',
  },
  {
    id: 17,
    content: 'Blue chip stocks là loại cổ phiếu có đặc điểm gì?',
    category: 'Đầu tư',
    difficulty: 'Dễ',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-17',
  },
  {
    id: 18,
    content: 'Chỉ số VN-Index của Việt Nam phản ánh điều gì về thị trường chứng khoán?',
    category: 'Đầu tư',
    difficulty: 'Trung bình',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-18',
  },
  {
    id: 19,
    content: 'Khái niệm "rủi ro thanh khoản" trong đầu tư có ý nghĩa gì?',
    category: 'Tài chính',
    difficulty: 'Khó',
    grade: 12,
    hasImage: false,
    createdAt: '2024-10-19',
  },
  {
    id: 20,
    content: 'Nguyên tắc "mua thấp bán cao" trong đầu tư cần lưu ý điều gì?',
    category: 'Đầu tư',
    difficulty: 'Trung bình',
    grade: 11,
    hasImage: false,
    createdAt: '2024-10-20',
  },
])

// Computed
const filteredQuestions = computed(() => {
  return questions.value.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredQuestions.value.length / itemsPerPage)
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredQuestions.value.slice(start, end)
})

// Methods
const logout = () => {
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')
  router.push('/admin')
}

const editQuestion = (question) => {
  editingQuestion.value = { ...question }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingQuestion.value = {}
}

const saveQuestion = () => {
  const index = questions.value.findIndex((q) => q.id === editingQuestion.value.id)
  if (index !== -1) {
    questions.value[index] = { ...editingQuestion.value }
  }
  closeEditModal()
}

const deleteQuestion = (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
    questions.value = questions.value.filter((q) => q.id !== id)
  }
}

onMounted(() => {
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.coming-soon {
  background: white;
  padding: 4rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

.coming-soon-content h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
}

.coming-soon-content p {
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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

  .coming-soon {
    padding: 2rem;
  }

  .coming-soon-content h2 {
    font-size: 2rem;
  }
}

/* New styles for questions management */
.questions-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-question-btn {
  background: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.add-question-btn:hover {
  background: #059669;
}

.questions-list {
  padding: 2rem;
}

.list-header h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.questions-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 200px;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.table-header {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.table-row {
  border-bottom: 1px solid #f7fafc;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.col-id {
  font-weight: 600;
  color: #667eea;
}

.question-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-preview p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.has-image-indicator {
  flex-shrink: 0;
  font-size: 0.75rem;
  opacity: 0.7;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: #dbeafe;
  color: #1e40af;
}

.edit-btn:hover {
  background: #bfdbfe;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #059669;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .questions-list {
    padding: 1rem;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 1rem;
    background: white;
  }

  .col-id::before {
    content: 'ID: ';
    font-weight: 600;
    color: #4a5568;
  }

  .col-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
