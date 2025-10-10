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
          Tạo câu hỏi
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

            <div class="filter-controls">
              <label class="filter-checkbox">
                <input v-model="includeInactive" type="checkbox" @change="loadQuestions" />
                <span>Hiển thị câu hỏi đã ẩn</span>
              </label>

              <button @click="loadQuestions" class="refresh-btn" :disabled="isLoading">
                <span v-if="isLoading">🔄</span>
                <span v-else>↻</span>
                Làm mới
              </button>
            </div>

            <RouterLink to="/admin/upload" class="add-question-btn"> Thêm câu hỏi </RouterLink>
          </div>
        </div>

        <!-- Questions List -->
        <div class="questions-list">
          <div class="list-header">
            <h3>Danh sách câu hỏi ({{ filteredQuestions.length }}/{{ questions.length }})</h3>
            <div class="list-stats">
              <span class="stat-item">Hoạt động: {{ activeQuestionsCount }}</span>
              <span class="stat-item">Tổng: {{ questions.length }}</span>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner-large"></div>
            <p>Đang tải câu hỏi...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="questions.length === 0" class="empty-state">
            <h4>Chưa có câu hỏi nào</h4>
            <p>Hãy tạo câu hỏi đầu tiên của bạn</p>
          </div>

          <!-- Questions Table -->
          <div v-else class="questions-table">
            <div class="table-header">
              <div class="col-status">Trạng thái</div>
              <div class="col-content">Nội dung câu hỏi</div>
              <div class="col-answers">Đáp án</div>
              <div class="col-date">Ngày tạo</div>
              <div class="col-actions">Thao tác</div>
            </div>

            <div v-for="question in paginatedQuestions" :key="question.id" class="table-row">
              <div class="col-status">
                <button
                  @click="toggleQuestionStatus(question)"
                  class="status-btn"
                  :class="{ active: question.isActive }"
                >
                  {{ question.isActive ? 'Hoạt động' : 'Đã ẩn' }}
                </button>
              </div>

              <div class="col-content">
                <div class="question-preview">
                  <p class="question-text">{{ question.content }}</p>
                  <img
                    v-if="question.imageUrl"
                    :src="question.imageUrl"
                    alt="Question image"
                    class="question-thumbnail"
                  />
                </div>
              </div>

              <div class="col-answers">
                <div class="answers-preview">
                  <div
                    v-for="(answer, index) in question.answers"
                    :key="answer.id"
                    class="answer-preview"
                    :class="`answer-${index + 1}`"
                  >
                    <span class="answer-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="answer-indicator" :class="{ correct: answer.isCorrect }">
                      {{ answer.isCorrect ? '✓' : '○' }}
                    </span>
                    <span class="answer-text">{{ answer.content }}</span>
                    <img
                      v-if="answer.imageUrl"
                      :src="answer.imageUrl"
                      alt="Answer image"
                      class="answer-thumbnail"
                    />
                  </div>
                </div>
              </div>

              <div class="col-date">
                {{ formatDate(question.createdAt) }}
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
        <div class="modal-content edit-modal-large" @click.stop>
          <div class="modal-header">
            <h3>Chỉnh sửa câu hỏi</h3>
            <button @click="closeEditModal" class="close-btn">❌</button>
          </div>

          <!-- Loading state for edit modal -->
          <div v-if="isLoadingEdit" class="modal-loading">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu câu hỏi...</p>
          </div>

          <div v-else class="modal-body">
            <!-- Question Content -->
            <div class="form-group">
              <label>Nội dung câu hỏi *</label>
              <textarea
                v-model="editingQuestion.content"
                rows="4"
                placeholder="Nhập nội dung câu hỏi..."
                required
              ></textarea>
            </div>

            <!-- Question Image -->
            <div class="form-group">
              <label>Hình ảnh câu hỏi</label>
              <div class="image-upload-section">
                <div v-if="editingQuestion.imageUrl" class="current-image">
                  <img :src="editingQuestion.imageUrl" alt="Question image" class="preview-image" />
                  <button @click="removeQuestionImage" class="remove-image-btn">❌ Xóa ảnh</button>
                </div>
                <input
                  type="file"
                  @change="onQuestionImageChange"
                  accept="image/*"
                  class="file-input"
                  ref="questionImageInput"
                />
              </div>
            </div>

            <!-- Answers Section -->
            <div class="answers-section">
              <h4>Các đáp án</h4>
              <div
                v-for="(answer, index) in editingQuestion.answers"
                :key="answer.id || index"
                class="answer-edit-card"
                :class="`answer-card-${index + 1}`"
              >
                <div class="answer-header">
                  <span class="answer-label">{{ String.fromCharCode(65 + index) }}.</span>
                  <label class="correct-checkbox">
                    <input
                      type="radio"
                      :name="'correct-answer-' + editingQuestion.id"
                      :value="index"
                      v-model="correctAnswerIndex"
                      @change="updateCorrectAnswer"
                    />
                    <span class="checkbox-label">Đáp án đúng</span>
                  </label>
                </div>

                <div class="answer-content-group">
                  <label>Nội dung đáp án *</label>
                  <textarea
                    v-model="answer.content"
                    rows="2"
                    :placeholder="`Nhập nội dung đáp án ${String.fromCharCode(65 + index)}...`"
                    required
                  ></textarea>
                </div>

                <div class="answer-image-group">
                  <label>Hình ảnh đáp án</label>
                  <div class="image-upload-section">
                    <div v-if="answer.imageUrl" class="current-image">
                      <img :src="answer.imageUrl" alt="Answer image" class="preview-image-small" />
                      <button @click="removeAnswerImage(index)" class="remove-image-btn-small">
                        ❌
                      </button>
                    </div>
                    <input
                      type="file"
                      @change="(e) => onAnswerImageChange(e, index)"
                      accept="image/*"
                      class="file-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Status -->
            <div class="form-group">
              <label class="status-checkbox">
                <input type="checkbox" v-model="editingQuestion.isActive" />
                <span>Câu hỏi đang hoạt động</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditModal" class="cancel-btn">Hủy bỏ</button>
            <button @click="saveQuestion" class="save-btn" :disabled="!canSave">
              <span v-if="isSaving">Đang lưu...</span>
              <span v-else>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDeleteQuestion">
        <div class="modal-content delete-modal" @click.stop>
          <div class="modal-header">
            <h3>Xác nhận xóa câu hỏi</h3>
            <button @click="cancelDeleteQuestion" class="close-btn">❌</button>
          </div>

          <div class="modal-body">
            <div class="delete-warning">
              <div class="warning-icon">⚠️</div>
              <p><strong>Bạn có chắc chắn muốn xóa câu hỏi này?</strong></p>
              <div class="question-preview-delete">
                <p class="question-content">{{ deletingQuestionContent }}</p>
              </div>
              <p class="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="cancelDeleteQuestion" class="cancel-btn">Hủy bỏ</button>
            <button @click="confirmDeleteQuestion" class="delete-confirm-btn">Xác nhận xóa</button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="showError" class="error-message" @click="showError = false">
        <div class="error-content">
          <div class="error-icon">❌</div>
          <h3>Lỗi</h3>
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="success-message" @click="showSuccess = false">
        <div class="success-content">
          <div class="success-icon">✅</div>
          <h3>Thành công</h3>
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { performLogout } from '@/utils/auth.js'
import questionApi from '@/api/questionApi.js'

const router = useRouter()
const adminEmail = ref('')

// Search and filter
const searchQuery = ref('')
const includeInactive = ref(true)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Edit modal
const showEditModal = ref(false)
const editingQuestion = ref({})
const isLoadingEdit = ref(false)
const isSaving = ref(false)
const correctAnswerIndex = ref(0)

// Delete confirmation modal
const showDeleteModal = ref(false)
const deletingQuestionId = ref(null)
const deletingQuestionContent = ref('')

// Loading and error states
const isLoading = ref(false)
const errorMessage = ref('')
const showError = ref(false)
const successMessage = ref('')
const showSuccess = ref(false)

// Questions data from API
const questions = ref([])

// Load questions from API
const loadQuestions = async () => {
  isLoading.value = true
  try {
    const response = await questionApi.getAllQuestions(includeInactive.value)
    if (response.success) {
      questions.value = response.data
      console.log('Questions loaded:', response.data.length)
    } else {
      throw new Error(response.message || 'Failed to load questions')
    }
  } catch (error) {
    console.error('Load questions failed:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải câu hỏi'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  } finally {
    isLoading.value = false
  }
}

// Computed
const filteredQuestions = computed(() => {
  return questions.value.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = includeInactive.value || q.isActive
    return matchesSearch && matchesStatus
  })
})

const activeQuestionsCount = computed(() => {
  return questions.value.filter((q) => q.isActive).length
})

const totalPages = computed(() => {
  return Math.ceil(filteredQuestions.value.length / itemsPerPage)
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredQuestions.value.slice(start, end)
})

// Edit modal computed properties
const canSave = computed(() => {
  if (!editingQuestion.value || !editingQuestion.value.content) return false
  if (!editingQuestion.value.answers || editingQuestion.value.answers.length < 4) return false

  // Check if all answers have content
  return editingQuestion.value.answers.every((answer) => answer.content && answer.content.trim())
})

// Methods
const logout = async () => {
  // Call logout API and clear auth
  await performLogout()

  // Clear old admin session data (backward compatibility)
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')

  // Redirect to admin login
  router.push('/admin')
}

const editQuestion = async (question) => {
  showEditModal.value = true
  isLoadingEdit.value = true

  try {
    // Fetch complete question data from API
    const response = await questionApi.getQuestionById(question.id)

    if (response.success) {
      editingQuestion.value = { ...response.data }

      // Set initial correct answer index
      const correctIndex = editingQuestion.value.answers.findIndex((answer) => answer.isCorrect)
      correctAnswerIndex.value = correctIndex >= 0 ? correctIndex : 0
    } else {
      throw new Error(response.message || 'Failed to load question details')
    }
  } catch (error) {
    console.error('Load question details failed:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Có lỗi khi tải thông tin câu hỏi'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
    showEditModal.value = false
  } finally {
    isLoadingEdit.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingQuestion.value = {}
  correctAnswerIndex.value = 0
  isLoadingEdit.value = false
  isSaving.value = false
}

const updateCorrectAnswer = () => {
  // Update all answers' isCorrect property
  editingQuestion.value.answers.forEach((answer, index) => {
    answer.isCorrect = index === correctAnswerIndex.value
  })
}

const removeQuestionImage = () => {
  editingQuestion.value.imageUrl = null
}

const removeAnswerImage = (answerIndex) => {
  editingQuestion.value.answers[answerIndex].imageUrl = null
}

const onQuestionImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const response = await questionApi.uploadQuestionImage(file)
    if (response.success) {
      editingQuestion.value.imageUrl = response.data.imageUrl
    } else {
      throw new Error(response.message || 'Failed to upload image')
    }
  } catch (error) {
    console.error('Upload image failed:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Có lỗi khi tải ảnh lên'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  }
}

const onAnswerImageChange = async (event, answerIndex) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const response = await questionApi.uploadQuestionImage(file)
    if (response.success) {
      editingQuestion.value.answers[answerIndex].imageUrl = response.data.imageUrl
    } else {
      throw new Error(response.message || 'Failed to upload image')
    }
  } catch (error) {
    console.error('Upload answer image failed:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Có lỗi khi tải ảnh đáp án lên'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  }
}

const saveQuestion = async () => {
  if (!canSave.value) return

  isSaving.value = true

  try {
    // Prepare data for API
    const questionData = {
      content: editingQuestion.value.content,
      imageUrl: editingQuestion.value.imageUrl,
      isActive: editingQuestion.value.isActive,
      answers: editingQuestion.value.answers.map((answer, index) => ({
        content: answer.content,
        imageUrl: answer.imageUrl,
        isCorrect: answer.isCorrect,
        order: index + 1,
      })),
    }

    const response = await questionApi.patchQuestion(editingQuestion.value.id, questionData)

    if (response.success) {
      // Update local data
      const index = questions.value.findIndex((q) => q.id === editingQuestion.value.id)
      if (index !== -1) {
        questions.value[index] = { ...editingQuestion.value }
      }
      closeEditModal()

      // Show success message
      successMessage.value = 'Câu hỏi đã được cập nhật thành công!'
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    } else {
      throw new Error(response.message || 'Failed to update question')
    }
  } catch (error) {
    console.error('Update question failed:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Có lỗi khi cập nhật câu hỏi'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  } finally {
    isSaving.value = false
  }
}

const deleteQuestion = (id) => {
  const question = questions.value.find((q) => q.id === id)
  if (question) {
    deletingQuestionId.value = id
    deletingQuestionContent.value = question.content
    showDeleteModal.value = true
  }
}

const confirmDeleteQuestion = async () => {
  const id = deletingQuestionId.value
  showDeleteModal.value = false

  try {
    const response = await questionApi.deleteQuestion(id)

    if (response.success) {
      // Remove from local data
      questions.value = questions.value.filter((q) => q.id !== id)
    } else {
      throw new Error(response.message || 'Failed to delete question')
    }
  } catch (error) {
    console.error('Delete question failed:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Có lỗi khi xóa câu hỏi'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  }
}

const cancelDeleteQuestion = () => {
  showDeleteModal.value = false
  deletingQuestionId.value = null
  deletingQuestionContent.value = ''
}

const toggleQuestionStatus = async (question) => {
  try {
    const response = await questionApi.patchQuestion(question.id, {
      isActive: !question.isActive,
    })

    if (response.success) {
      // Update local data
      const index = questions.value.findIndex((q) => q.id === question.id)
      if (index !== -1) {
        questions.value[index] = { ...questions.value[index], isActive: !question.isActive }
      }
    } else {
      throw new Error(response.message || 'Failed to toggle question status')
    }
  } catch (error) {
    console.error('Toggle question status failed:', error)
    errorMessage.value =
      error.response?.data?.message || error.message || 'Có lỗi khi thay đổi trạng thái câu hỏi'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
  if (!localStorage.getItem('adminLoggedIn')) {
    router.push('/admin')
    return
  }

  adminEmail.value = localStorage.getItem('adminEmail') || 'admin@sectest.com'
  loadQuestions()
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  min-height: calc(100vh - 140px);
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
  width: 100%;
  min-height: calc(100vh - 200px);
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

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.list-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 12px;
}

.questions-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 140px 2.5fr 2.5fr 120px 140px;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.25rem;
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

.col-status {
  display: flex;
  align-items: center;
}

.status-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn.active {
  background: #d1fae5;
  color: #065f46;
}

.status-btn:not(.active) {
  background: #fee2e2;
  color: #991b1b;
}

.question-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-thumbnail,
.answer-thumbnail,
.preview-image,
.preview-image-small {
  width: 800px; /* Explicitly set width */
  height: 600px; /* Explicitly set height */
  border-radius: 6px;
  margin: 1rem 0;
  object-fit: cover; /* Ensure images fit within the specified dimensions */
}

.answers-preview {
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.answer-preview {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: background 0.2s;
}

.answer-preview:hover {
  background: #f1f5f9;
}

.answer-preview.answer-1 {
  border-left: 3px solid #3b82f6;
}
.answer-preview.answer-2 {
  border-left: 3px solid #10b981;
}
.answer-preview.answer-3 {
  border-left: 3px solid #f59e0b;
}
.answer-preview.answer-4 {
  border-left: 3px solid #ef4444;
}

.answer-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 18px;
  font-size: 0.75rem;
}

.answer-indicator {
  font-weight: bold;
  color: #6b7280;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-indicator.correct {
  color: #059669;
  background: #d1fae5;
  border-radius: 50%;
  width: 16px;
  height: 16px;
}

.answer-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
  font-size: 0.8rem;
  line-height: 1.3;
}

.answer-thumbnail {
  width: 35px;
  height: 22px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
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

/* Delete Modal Styles */
.delete-modal {
  max-width: 500px;
}

.delete-warning {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.delete-warning p {
  margin-bottom: 1rem;
  color: #374151;
}

.delete-warning .warning-text {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.875rem;
}

.question-preview-delete {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
}

.question-preview-delete .question-content {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #4a5568;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.delete-confirm-btn {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-confirm-btn:hover {
  background: #b91c1c;
}

/* Enhanced Edit Modal Styles */
.edit-modal-large {
  max-width: 900px;
  width: 95%;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.current-image {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.preview-image-small {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.remove-image-btn {
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: #fecaca;
}

.remove-image-btn-small {
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn-small:hover {
  background: #fecaca;
}

.file-input {
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-input:hover {
  border-color: #667eea;
}

.answers-section {
  margin-top: 1.5rem;
}

.answers-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.answer-edit-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  background: #fafbfc;
  transition: border-color 0.2s;
}

.answer-edit-card:hover {
  border-color: #cbd5e0;
}

.answer-card-1 {
  border-left: 4px solid #3b82f6;
}
.answer-card-2 {
  border-left: 4px solid #10b981;
}
.answer-card-3 {
  border-left: 4px solid #f59e0b;
}
.answer-card-4 {
  border-left: 4px solid #ef4444;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.answer-label {
  font-weight: 700;
  font-size: 1.125rem;
  color: #374151;
  min-width: 24px;
}

.correct-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.correct-checkbox input[type='radio'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 500;
  color: #059669;
  font-size: 0.875rem;
}

.answer-content-group {
  margin-bottom: 1rem;
}

.answer-content-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.answer-image-group {
  margin-top: 1rem;
}

.answer-image-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.status-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  transition: background 0.2s;
}

.status-checkbox:hover {
  background: #e0f2fe;
}

.status-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.status-checkbox span {
  font-weight: 500;
  color: #0c4a6e;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .list-stats {
    flex-direction: row;
    gap: 0.5rem;
  }

  .search-box {
    min-width: auto;
  }

  .questions-list {
    padding: 1rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: block;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 1rem;
    background: white;
  }

  .col-status,
  .col-content,
  .col-answers,
  .col-date,
  .col-actions {
    display: block;
    margin-bottom: 0.75rem;
  }

  .col-status::before {
    content: 'Trạng thái: ';
    font-weight: 600;
    color: #4a5568;
  }

  .col-content::before {
    content: 'Nội dung: ';
    font-weight: 600;
    color: #4a5568;
    display: block;
    margin-bottom: 0.5rem;
  }

  .col-answers::before {
    content: 'Đáp án: ';
    font-weight: 600;
    color: #4a5568;
    display: block;
    margin-bottom: 0.5rem;
  }

  .col-date::before {
    content: 'Ngày tạo: ';
    font-weight: 600;
    color: #4a5568;
  }

  .col-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
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

/* Additional styles for new features */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #0369a1;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #e0f2fe;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-state h4 {
  margin-bottom: 0.5rem;
  color: #374151;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn.active {
  background: #d1fae5;
  color: #065f46;
}

.status-btn:not(.active) {
  background: #fee2e2;
  color: #991b1b;
}

.question-thumbnail,
.answer-thumbnail {
  width: 40px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.answers-preview {
  font-size: 0.875rem;
}

.answer-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.answer-indicator {
  font-weight: bold;
  color: #6b7280;
}

.answer-indicator.correct {
  color: #059669;
}

.answer-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.more-answers {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.error-message {
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
  cursor: pointer;
}

.error-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
}

.error-content p {
  margin: 0;
  color: #4a5568;
  word-wrap: break-word;
}

/* Success Message Styles */
.success-message {
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
  cursor: pointer;
}

.success-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  animation: slideIn 0.3s ease;
  border: 2px solid #10b981;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-content h3 {
  margin: 0 0 0.5rem 0;
  color: #059669;
}

.success-content p {
  margin: 0;
  color: #4a5568;
  word-wrap: break-word;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
