<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Tạo Bộ Đề</h1>
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
          Tạo bộ đề
        </RouterLink>
      </div>
    </nav>

    <main class="dashboard-main">
      <div class="question-set-form-container">
        <div class="form-section">
          <form @submit.prevent="submitQuestionSet" class="question-set-form">
            <div class="form-group">
              <label for="setName">Tên bộ đề *</label>
              <input id="setName" v-model="setName" required placeholder="Nhập tên bộ đề..." />
            </div>
            <div class="questions-list">
              <div v-for="(q, qIdx) in questions" :key="qIdx" class="question-block">
                <div class="question-header">
                  <span class="question-number">Câu {{ qIdx + 1 }}</span>
                </div>
                <div class="form-group">
                  <label>Nội dung câu hỏi *</label>
                  <textarea
                    v-model="q.content"
                    required
                    placeholder="Nhập nội dung câu hỏi..."
                    rows="2"
                  ></textarea>
                </div>
                <div class="form-group">
                  <button
                    type="button"
                    class="toggle-image-btn"
                    @click="q.showImage = !q.showImage"
                  >
                    <span v-if="!q.showImage">+ Thêm ảnh cho câu hỏi</span>
                    <span v-else>Ẩn ảnh câu hỏi</span>
                  </button>
                  <div v-if="q.showImage" class="question-image-upload">
                    <FileUpload
                      v-model="q.image"
                      accept="image/*"
                      title="Tải ảnh câu hỏi"
                      supportedFormats="JPG, PNG, GIF (tối đa 5MB)"
                      :maxSize="5 * 1024 * 1024"
                      @preview="q.imagePreview = $event"
                    />
                  </div>
                </div>
                <div class="answers-list">
                  <div v-for="(a, aIdx) in q.answers" :key="aIdx" class="answer-item">
                    <div class="answer-header">
                      <span class="answer-label">Đáp án {{ String.fromCharCode(65 + aIdx) }}</span>
                      <label class="correct-checkbox">
                        <input
                          type="radio"
                          :name="'correct-' + qIdx"
                          v-model="q.correctIndex"
                          :value="aIdx"
                        />
                        <span class="checkmark">✓</span> Đúng
                      </label>
                    </div>
                    <div class="answer-input-group">
                      <input
                        v-model="a.content"
                        type="text"
                        required
                        :placeholder="`Nhập đáp án ${String.fromCharCode(65 + aIdx)}...`"
                      />
                    </div>
                    <div class="answer-image-toggle">
                      <button
                        type="button"
                        class="toggle-image-btn"
                        @click="a.showImage = !a.showImage"
                      >
                        <span v-if="!a.showImage">+ Thêm ảnh đáp án</span>
                        <span v-else>Ẩn ảnh đáp án</span>
                      </button>
                      <div v-if="a.showImage" class="answer-image-upload">
                        <FileUpload
                          v-model="a.image"
                          accept="image/*"
                          :title="`Tải ảnh đáp án ${String.fromCharCode(65 + aIdx)}`"
                          supportedFormats="JPG, PNG, GIF (tối đa 2MB)"
                          :maxSize="2 * 1024 * 1024"
                          @preview="a.imagePreview = $event"
                          class="compact-upload"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="resetForm" class="reset-btn">Làm mới</button>
              <button type="submit" :disabled="isSaving" class="save-btn">
                <span v-if="isSaving" class="loading-content">
                  <span class="spinner"></span>
                  {{ uploadProgress || 'Đang lưu...' }}
                </span>
                <span v-else>Tạo bộ đề</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-message" @click="showSuccess = false">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>Tạo bộ đề thành công!</h3>
        <p>Bộ đề đã được lưu vào hệ thống.</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="showError" class="error-message" @click="showError = false">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3>Lỗi khi tạo bộ đề!</h3>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { performLogout } from '@/utils/auth.js'
import FileUpload from '@/components/FileUpload.vue'
import questionApi from '@/api/questionApi.js'

const router = useRouter()
const adminEmail = ref('')
const isSaving = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const showError = ref(false)
const uploadProgress = ref('')
const triedSubmit = ref(false)

function makeQuestion() {
  return {
    content: '',
    image: null,
    imagePreview: null,
    showImage: false,
    correctIndex: 0,
    answers: Array.from({ length: 4 }, (_, i) => ({
      content: '',
      image: null,
      imagePreview: null,
      showImage: false,
      order: i,
    })),
  }
}

const setName = ref('')
const questions = ref(Array.from({ length: 20 }, makeQuestion))

const isSetFormValid = computed(() => {
  if (!setName.value.trim()) return false
  for (const q of questions.value) {
    if (!q.content.trim()) return false
    if (!q.answers.every((a) => a.content.trim() || a.image)) return false
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) return false
  }
  return true
})

const isSetNameInvalid = computed(() => triedSubmit.value && !setName.value.trim())
const isQuestionInvalid = (q) => triedSubmit.value && !q.content.trim()
const isAnswerInvalid = (a) => triedSubmit.value && !(a.content.trim() || a.image)

const resetForm = () => {
  setName.value = ''
  questions.value = Array.from({ length: 20 }, makeQuestion)
}

const logout = async () => {
  await performLogout()
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('adminEmail')
  router.push('/admin')
}

const uploadImageIfNeeded = async (file) => {
  if (!file) return null
  const res = await questionApi.uploadQuestionImage(file)
  return res.data?.imageUrl || null
}

const submitQuestionSet = async () => {
  triedSubmit.value = true
  if (!isSetFormValid.value) return
  isSaving.value = true
  showError.value = false
  uploadProgress.value = ''
  try {
    // Upload all images and build questions array
    uploadProgress.value = 'Đang tải ảnh...'
    const processedQuestions = []
    for (let i = 0; i < questions.value.length; i++) {
      const q = questions.value[i]
      let imageUrl = null
      if (q.image) imageUrl = await uploadImageIfNeeded(q.image)
      const processedAnswers = []
      for (let j = 0; j < q.answers.length; j++) {
        const a = q.answers[j]
        let answerImageUrl = null
        if (a.image) answerImageUrl = await uploadImageIfNeeded(a.image)
        processedAnswers.push({
          content: a.content.trim(),
          imageUrl: answerImageUrl,
          isCorrect: q.correctIndex === j,
          order: j,
        })
      }
      processedQuestions.push({
        content: q.content.trim(),
        imageUrl,
        answers: processedAnswers,
      })
    }
    const data = {
      name: setName.value.trim(),
      questions: processedQuestions,
    }
    uploadProgress.value = 'Đang tạo bộ đề...'
    const response = await questionApi.createQuestionSet(data)
    if (response.success) {
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
      resetForm()
    } else {
      throw new Error(response.message || 'Tạo bộ đề thất bại')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Có lỗi khi tạo bộ đề'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 5000)
  } finally {
    isSaving.value = false
    uploadProgress.value = ''
  }
}

onMounted(() => {
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

.question-set-form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.question-set-form {
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

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-block {
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fafafa;
}

.question-header {
  margin-bottom: 1rem;
}

.question-number {
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
}

.answers-list {
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

.correct-checkbox input[type='radio'] {
  width: auto;
  margin: 0;
}

.checkmark {
  font-weight: bold;
}

.answer-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.answer-input-group input[type='text'] {
  flex: 1;
}

.answer-image-toggle {
  margin-top: 0.75rem;
}

.toggle-image-btn {
  background: #edf2f7;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.toggle-image-btn:hover {
  background: #e2e8f0;
  border-color: #4f46e5;
}

.question-image-upload,
.answer-image-upload {
  margin-top: 0.5rem;
}

.answer-image-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.compact-upload {
  font-size: 0.875rem;
}

.compact-upload .upload-area {
  min-height: 80px;
  padding: 1rem;
}

.compact-upload .upload-content h4 {
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.compact-upload .upload-content p {
  font-size: 0.75rem;
  margin: 0.25rem 0;
}

.compact-upload .upload-icon svg {
  width: 24px;
  height: 24px;
}

.compact-upload .image-preview img {
  max-height: 80px;
}

.save-btn {
  background: linear-gradient(90deg, #6366f1 0%, #3b82f6 100%);
  color: #fff;
  border: none;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 4px 16px 0 rgba(59, 130, 246, 0.1);
  transition:
    background 0.2s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #a5b4fc;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #4f46e5 0%, #2563eb 100%);
  box-shadow: 0 6px 24px 0 rgba(59, 130, 246, 0.15);
}

.reset-btn {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.03);
}

.reset-btn:hover {
  background: #e5e7eb;
  color: #111827;
  border-color: #a1a1aa;
}

.form-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message,
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

.success-content,
.error-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.success-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-content h3 {
  margin: 0 0 0.5rem 0;
  color: #059669;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
}

.success-content p,
.error-content p {
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

  .question-set-form-container {
    padding: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-group label {
    font-size: 0.75rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .questions-list {
    gap: 1.5rem;
  }

  .question-block {
    padding: 1rem;
  }

  .question-header {
    margin-bottom: 0.75rem;
  }

  .question-number {
    font-size: 0.875rem;
  }

  .answers-list {
    gap: 0.75rem;
  }

  .answer-item {
    padding: 0.75rem;
  }

  .answer-header {
    margin-bottom: 0.25rem;
  }

  .answer-label {
    font-size: 0.75rem;
  }

  .correct-checkbox {
    font-size: 0.75rem;
  }

  .answer-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .answer-image-toggle {
    margin-top: 0.5rem;
  }

  .compact-upload .upload-area {
    min-height: 60px;
    padding: 0.75rem;
  }

  .compact-upload .image-preview img {
    max-height: 60px;
  }

  .save-btn {
    padding: 0.75rem;
  }

  .save-new-btn {
    padding: 0.75rem;
  }
}
</style>
