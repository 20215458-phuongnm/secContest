<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Tạo Câu Hỏi</h1>
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
        <RouterLink to="/admin/questions" class="nav-item">
          <span class="nav-icon"></span>
          Quản lý câu hỏi
        </RouterLink>
        <RouterLink to="/admin/upload" class="nav-item active">
          <span class="nav-icon"></span>
          Tạo câu hỏi
        </RouterLink>
      </div>
    </nav>

    <main class="dashboard-main">
      <div class="question-form-container">
        <!-- Question Form -->
        <div class="form-section">
          <form @submit.prevent="saveQuestion" class="question-form">
            <!-- Question Content -->
            <div class="form-group">
              <label for="question">Nội dung câu hỏi *</label>
              <textarea
                id="question"
                v-model="question.content"
                required
                placeholder="Nhập nội dung câu hỏi..."
                rows="4"
              ></textarea>
            </div>

            <!-- Question Image -->
            <div class="form-group">
              <label>Ảnh kèm theo</label>
              <FileUpload
                v-model="question.image"
                accept="image/*"
                title="Tải ảnh lên"
                supportedFormats="Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)"
                :maxSize="5 * 1024 * 1024"
                @preview="question.imagePreview = $event"
              />
            </div>

            <!-- Answer Options -->
            <div class="form-group">
              <label>Đáp án</label>
              <div class="answers-container">
                <div v-for="(answer, index) in question.answers" :key="index" class="answer-item">
                  <div class="answer-header">
                    <span class="answer-label">Đáp án {{ index + 1 }}</span>
                    <button
                      v-if="question.answers.length > 2"
                      type="button"
                      @click="removeAnswer(index)"
                      class="remove-answer-btn"
                    >
                      ❌
                    </button>
                  </div>
                  <div class="answer-input-group">
                    <input
                      v-model="answer.content"
                      type="text"
                      :placeholder="`Nhập đáp án ${index + 1}...`"
                      required
                    />
                    <label class="correct-checkbox">
                      <input
                        v-model="answer.isCorrect"
                        type="checkbox"
                        @change="validateCorrectAnswers"
                      />
                      <span class="checkmark">✓</span>
                      Đúng
                    </label>
                  </div>
                </div>

                <button
                  v-if="question.answers.length < 6"
                  type="button"
                  @click="addAnswer"
                  class="add-answer-btn"
                >
                   Thêm đáp án
                </button>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" @click="resetForm" class="reset-btn">Làm mới</button>
              <button type="submit" :disabled="!isFormValid || isSaving" class="save-btn">
                <span v-if="isSaving">Đang lưu...</span>
                <span v-else>Lưu câu hỏi</span>
              </button>
              <button
                type="button"
                @click="saveAndCreateNew"
                :disabled="!isFormValid || isSaving"
                class="save-new-btn"
              >
                Lưu & Tạo mới
              </button>
            </div>
          </form>
        </div>

        <!-- Preview Section -->
        <div class="preview-section">
          <h3>Xem trước</h3>
          <div class="question-preview">
            <div v-if="question.content" class="preview-question">
              <h4>{{ question.content }}</h4>
              <img
                v-if="question.imagePreview"
                :src="question.imagePreview"
                alt="Question image"
                class="preview-image"
              />
            </div>

            <div v-if="question.answers.some((a) => a.content.trim())" class="preview-answers">
              <div
                v-for="(answer, index) in question.answers.filter((a) => a.content.trim())"
                :key="index"
                class="preview-answer"
                :class="{ correct: answer.isCorrect }"
              >
                <span class="answer-letter">{{ String.fromCharCode(65 + index) }}.</span>
                {{ answer.content }}
                <span v-if="answer.isCorrect" class="correct-indicator">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-message" @click="showSuccess = false">
      <div class="success-content">
        <h3>Tạo câu hỏi thành công!</h3>
        <p>Câu hỏi đã được lưu vào hệ thống.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FileUpload from '@/components/FileUpload.vue'

const router = useRouter()

// Refs
const adminEmail = ref('')
const isSaving = ref(false)
const showSuccess = ref(false)

// Question data
const question = ref({
  content: '',
  image: null,
  imagePreview: null,
  answers: [
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ],
  category: 'Toán',
  difficulty: 'Trung bình',
  grade: 10,
  points: 10,
  explanation: '',
})

// Computed
const isFormValid = computed(() => {
  const hasContent = question.value.content.trim().length > 0
  const hasValidAnswers = question.value.answers.filter((a) => a.content.trim()).length >= 2
  const hasCorrectAnswer = question.value.answers.some((a) => a.isCorrect && a.content.trim())
  return hasContent && hasValidAnswers && hasCorrectAnswer
})

// Methods
const logout = () => {
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')
  router.push('/admin')
}

// Image handling is now managed by FileUpload component

const addAnswer = () => {
  if (question.value.answers.length < 6) {
    question.value.answers.push({ content: '', isCorrect: false })
  }
}

const removeAnswer = (index) => {
  if (question.value.answers.length > 2) {
    question.value.answers.splice(index, 1)
  }
}

const validateCorrectAnswers = () => {
  // Ensure at least one correct answer
  const hasCorrect = question.value.answers.some((a) => a.isCorrect)
  if (!hasCorrect && question.value.answers.length > 0) {
    // If no correct answer, make first non-empty answer correct
    const firstNonEmpty = question.value.answers.find((a) => a.content.trim())
    if (firstNonEmpty) {
      firstNonEmpty.isCorrect = true
    }
  }
}

const saveQuestion = async () => {
  if (!isFormValid.value) return

  isSaving.value = true

  // Simulate saving
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Show success message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)

  isSaving.value = false
}

const saveAndCreateNew = async () => {
  await saveQuestion()
  if (!isSaving.value) {
    resetForm()
  }
}

const resetForm = () => {
  question.value = {
    content: '',
    image: null,
    imagePreview: null,
    answers: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ],
    category: 'Toán',
    difficulty: 'Trung bình',
    grade: 10,
    points: 10,
    explanation: '',
  }
}

// Lifecycle
onMounted(() => {
  // Check admin session
  const isLoggedIn = localStorage.getItem('adminLoggedIn')
  const email = localStorage.getItem('adminEmail')

  if (!isLoggedIn || isLoggedIn !== 'true' || !email) {
    router.push('/admin')
    return
  }

  adminEmail.value = email
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.question-form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.form-section,
.preview-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.question-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea,
.form-group select {
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
  border-color: #4f46e5;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.answers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-item {
  border: 2px solid #f7fafc;
  border-radius: 8px;
  padding: 1rem;
  background: #f7fafc;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.answer-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.remove-answer-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-answer-btn:hover {
  opacity: 1;
}

.answer-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.answer-input-group input[type='text'] {
  flex: 1;
}

.correct-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #059669;
  white-space: nowrap;
}

.correct-checkbox input[type='checkbox'] {
  width: auto;
  margin: 0;
}

.checkmark {
  font-weight: bold;
}

.add-answer-btn {
  padding: 0.75rem 1rem;
  background: #f0f9ff;
  color: #0369a1;
  border: 2px dashed #0369a1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-answer-btn:hover {
  background: #e0f2fe;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.reset-btn,
.save-btn,
.save-new-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.reset-btn:hover {
  background: #edf2f7;
}

.save-btn {
  background: #059669;
  color: white;
  flex: 1;
}

.save-btn:hover:not(:disabled) {
  background: #047857;
}

.save-new-btn {
  background: #3b82f6;
  color: white;
}

.save-new-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled,
.save-new-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.125rem;
}

.question-preview {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fafafa;
}

.preview-question h4 {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1rem;
  line-height: 1.5;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1rem 0;
}

.preview-answers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.preview-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
}

.preview-answer.correct {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #166534;
}

.answer-letter {
  font-weight: bold;
  min-width: 20px;
}

.correct-indicator {
  margin-left: auto;
  color: #22c55e;
  font-weight: bold;
}

.preview-explanation {
  margin: 1rem 0;
  padding: 1rem;
  background: #fffbeb;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.preview-explanation strong {
  color: #92400e;
}

.preview-explanation p {
  margin: 0.5rem 0 0 0;
  color: #78350f;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.meta-item {
  padding: 0.25rem 0.75rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

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
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.success-content p {
  margin: 0;
  color: #4a5568;
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

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .header-left h1 {
    font-size: 1.25rem;
  }

  .nav-container {
    padding: 0 1rem;
    gap: 1rem;
  }

  .dashboard-main {
    padding: 1rem;
  }

  .question-form-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-section,
  .preview-section {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .answer-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .correct-checkbox {
    justify-content: center;
  }
}
</style>
