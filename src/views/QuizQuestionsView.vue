<template>
  <div class="quiz-questions">
    <div class="quiz-body">
      <!-- Left side - Questions -->
      <div class="questions-section">
        <div v-if="questions.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải câu hỏi...</p>
        </div>

        <div v-else class="question-card">
          <div class="question-number">Câu {{ currentQuestion + 1 }}:</div>
          <div
            class="question-text"
            @selectstart="preventSelection"
            @copy="preventCopy"
            @contextmenu="preventRightClick"
          >
            {{ questions[currentQuestion].content }}
          </div>

          <!-- Question Image -->
          <div v-if="questions[currentQuestion].imageUrl" class="question-image">
            <img :src="questions[currentQuestion].imageUrl" alt="Question image" />
          </div>

          <div class="answers-section">
            <div
              v-for="(answer, index) in questions[currentQuestion].answers"
              :key="answer.id"
              class="answer-option"
              @click="selectAnswer(index)"
            >
              <input
                type="radio"
                :id="`answer-${answer.id}`"
                :name="`question-${currentQuestion}`"
                :value="index"
                :checked="userAnswers[currentQuestion]?.answerIndex === index"
                class="answer-radio"
              />
              <label :for="`answer-${answer.id}`" class="answer-label">
                {{ String.fromCharCode(65 + index) }}. {{ answer.content }}
                <img
                  v-if="answer.imageUrl"
                  :src="answer.imageUrl"
                  alt="Answer image"
                  class="answer-image"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Navigation buttons at bottom -->
        <div class="question-navigation">
          <button
            @click="previousQuestion"
            :disabled="currentQuestion === 0"
            class="nav-btn prev-btn"
          >
            ← Câu trước
          </button>
          <button
            @click="nextQuestion"
            :disabled="currentQuestion === questions.length - 1"
            class="nav-btn next-btn"
          >
            Câu tiếp theo →
          </button>
        </div>
      </div>

      <!-- Right side - Navigation and Submit -->
      <div class="sidebar">
        <!-- Timer -->
        <div class="timer-section">
          <div class="timer-label">Thời gian còn lại:</div>
          <div class="timer">{{ formatTime(timeRemaining) }}</div>
        </div>

        <!-- Question Navigation Grid -->
        <div class="question-nav">
          <div class="nav-title">Câu hỏi</div>
          <div class="question-grid">
            <button
              v-for="(question, index) in questions"
              :key="index"
              @click="goToQuestion(index)"
              :class="[
                'question-btn',
                {
                  current: index === currentQuestion,
                  answered: userAnswers[index] !== null,
                  unanswered: userAnswers[index] === null,
                },
              ]"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button @click="submitQuiz" class="submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <span class="loading-spinner"></span>
              Đang nộp bài...
            </span>
            <span v-else>NỘP BÀI</span>
          </button>
          <div class="submit-info">
            Đã hoàn thành: {{ answeredCount }}/{{ questions.length }} câu
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Submit Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Xác nhận nộp bài</h3>
        </div>
        <div class="modal-body">
          <p>
            Bạn còn <strong>{{ unansweredCount }}</strong> câu chưa trả lời.
          </p>
          <p>Bạn có chắc chắn muốn nộp bài không?</p>
        </div>
        <div class="modal-actions">
          <button @click="showConfirmModal = false" class="modal-btn cancel-btn">
            Tiếp tục làm bài
          </button>
          <button @click="confirmSubmit" class="modal-btn confirm-btn">Nộp bài ngay</button>
        </div>
      </div>
    </div>

    <!-- Time Up Modal -->
    <div v-if="showTimeUpModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Hết thời gian làm bài</h3>
        </div>
        <div class="modal-body">
          <p>Thời gian làm bài đã kết thúc!</p>
          <p>Hệ thống sẽ tự động nộp bài của bạn.</p>
        </div>
        <div class="modal-actions">
          <button @click="confirmTimeUpSubmit" class="modal-btn confirm-btn">Đồng ý</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { requireUserAuth, clearAuth, getUser } from '@/utils/auth.js'
import examApi from '@/api/examApi.js'

const router = useRouter()

// Quiz state
const currentQuestion = ref(0)
const userAnswers = ref([])
const timeRemaining = ref(30 * 60) // 30 minutes in seconds
const quizTimer = ref(null)
const isAutoSubmitting = ref(false)
const autoSubmitBufferSeconds = 5 // number of seconds before time up to trigger auto-submit
const examData = ref(null)
const sessionId = ref(null)
const isSubmitting = ref(false)
const startTime = ref(null) // Thời gian bắt đầu bài thi
const totalTime = ref(30 * 60) // Tổng thời gian làm bài (30 phút)

// Modal states
const showConfirmModal = ref(false)
const showTimeUpModal = ref(false)
const unansweredCount = ref(0)

// Load saved data from localStorage and calculate real remaining time
const loadQuizState = () => {
  const savedState = localStorage.getItem('quizState')
  if (savedState) {
    const state = JSON.parse(savedState)

    // If the saved state belongs to a different user or session, ignore it.
    try {
      const currentUser = getUser()
      if (
        !state.userId ||
        !currentUser ||
        state.userId !== currentUser.id ||
        (state.sessionId && sessionId.value && state.sessionId !== sessionId.value)
      ) {
        // Clear stale state so another user's progress isn't leaked
        localStorage.removeItem('quizState')
        console.log('Cleared stale quizState (belongs to another user or session)')
        return
      }
    } catch (err) {
      // If getUser throws or state malformed, remove saved state to be safe
      localStorage.removeItem('quizState')
      console.warn('Removed invalid quizState during load:', err)
      return
    }

    currentQuestion.value = state.currentQuestion || 0
    userAnswers.value = state.userAnswers || Array(questions.value.length).fill(null)

    // Calculate real remaining time based on start time
    if (state.startTime) {
      startTime.value = state.startTime
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime.value) / 1000)
      timeRemaining.value = Math.max(0, totalTime.value - elapsedSeconds)

      console.log('Quiz resumed:', {
        startTime: new Date(startTime.value),
        elapsed: elapsedSeconds,
        remaining: timeRemaining.value,
      })
    } else {
      // First time loading, use saved time or default
      timeRemaining.value = state.timeRemaining || totalTime.value
    }
  }
}

// Save quiz state to localStorage
const saveQuizState = () => {
  const state = {
    currentQuestion: currentQuestion.value,
    userAnswers: userAnswers.value,
    timeRemaining: timeRemaining.value,
    startTime: startTime.value, // Lưu thời gian bắt đầu
    totalTime: totalTime.value,
    lastSaved: Date.now(),
  }
  // Attach current user and session so saved state is scoped to that user/session
  try {
    const u = getUser()
    state.userId = u ? u.id : null
  } catch (e) {
    state.userId = null
  }
  state.sessionId = sessionId.value

  localStorage.setItem('quizState', JSON.stringify(state))
}

// Questions from API
const questions = ref([])

// Load exam data from sessionStorage
const loadExamData = () => {
  const savedExamData = sessionStorage.getItem('examData')
  if (!savedExamData) {
    alert('Không tìm thấy dữ liệu bài thi. Vui lòng bắt đầu lại.')
    router.push('/quiz')
    return
  }

  try {
    examData.value = JSON.parse(savedExamData)
    sessionId.value = examData.value.sessionId
    questions.value = examData.value.questions || []

    // Initialize user answers array
    userAnswers.value = Array(questions.value.length).fill(null)

    // Set total time from exam data or default to 30 minutes
    totalTime.value = examData.value.duration ? examData.value.duration * 60 : 30 * 60

    // Check if this is a new exam (no saved state) - set start time
    const savedState = localStorage.getItem('quizState')
    if (!savedState || !JSON.parse(savedState).startTime) {
      startTime.value = Date.now()
      timeRemaining.value = totalTime.value
      console.log('New exam started at:', new Date(startTime.value))
    }

    console.log('Loaded exam data:', examData.value)
  } catch (error) {
    console.error('Error parsing exam data:', error)
    alert('Dữ liệu bài thi không hợp lệ. Vui lòng bắt đầu lại.')
    router.push('/quiz')
  }
}

// Computed properties
const answeredCount = computed(() => {
  return userAnswers.value.filter((answer) => answer !== null).length
})

// Methods
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const selectAnswer = (answerIndex) => {
  const questionData = questions.value[currentQuestion.value]
  const selectedAnswer = questionData.answers[answerIndex]

  // Store both answer index and answer ID for API submission
  userAnswers.value[currentQuestion.value] = {
    answerIndex: answerIndex,
    answerId: selectedAnswer.id,
    questionId: questionData.id,
  }

  saveQuizState()
}

const goToQuestion = (questionIndex) => {
  currentQuestion.value = questionIndex
  saveQuizState()
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    saveQuizState()
  }
}

const nextQuestion = () => {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
    saveQuizState()
  }
}

const submitQuiz = async () => {
  const unansweredQuestions = userAnswers.value.filter((answer) => answer === null).length

  if (unansweredQuestions > 0) {
    unansweredCount.value = unansweredQuestions
    showConfirmModal.value = true
    return
  }

  // If all questions answered, submit directly
  await performSubmit()
}

const confirmSubmit = async () => {
  showConfirmModal.value = false
  await performSubmit()
}

const confirmTimeUpSubmit = async () => {
  // Prevent duplicate auto-submits
  if (isSubmitting.value || isAutoSubmitting.value) return
  isAutoSubmitting.value = true
  showTimeUpModal.value = false

  try {
    // Call submit exam API for time up case
    const answers = userAnswers.value
      .map((answer, index) => {
        if (answer && answer.answerId && answer.questionId) {
          return {
            questionId: answer.questionId,
            answerId: answer.answerId,
          }
        }
        return null
      })
      .filter((answer) => answer !== null)

    const examSubmissionData = {
      sessionId: sessionId.value,
      answers: answers,
    }

    const response = await examApi.submitExam(examSubmissionData)

    if (response.success) {
      // Save quiz results for display on results page
      const quizResults = {
        ...response.data,
        userAnswers: userAnswers.value,
        submissionTime: new Date().toISOString(),
        autoSubmitted: true,
      }
      sessionStorage.setItem('quizResults', JSON.stringify(quizResults))
    }
  } catch (error) {
    console.error('Failed to submit exam on timeout:', error)
    // Still proceed to results even if API fails
    const quizResults = {
      userAnswers: userAnswers.value,
      answeredCount: answeredCount.value,
      totalQuestions: questions.value.length,
      submissionTime: new Date().toISOString(),
      autoSubmitted: true,
    }
    sessionStorage.setItem('quizResults', JSON.stringify(quizResults))
  }

  // Clear saved quiz state after submission
  localStorage.removeItem('quizState')
  sessionStorage.removeItem('examData')

  // Redirect to results page
  router.push('/quiz-result')
}

const performSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  isAutoSubmitting.value = true

  try {
    // Prepare answers for API submission
    const answers = userAnswers.value
      .map((answer, index) => {
        if (answer && answer.answerId && answer.questionId) {
          return {
            questionId: answer.questionId,
            answerId: answer.answerId,
          }
        }
        return null
      })
      .filter((answer) => answer !== null)

    const examSubmissionData = {
      sessionId: sessionId.value,
      answers: answers,
    }

    console.log('Submitting exam:', examSubmissionData)

    const response = await examApi.submitExam(examSubmissionData)

    if (response.success) {
      console.log('Exam submitted successfully:', response.data)

      // Clear timer
      if (quizTimer.value) {
        clearInterval(quizTimer.value)
      }

      // Save quiz results for display on results page
      const quizResults = {
        ...response.data,
        userAnswers: userAnswers.value,
        submissionTime: new Date().toISOString(),
      }
      sessionStorage.setItem('quizResults', JSON.stringify(quizResults))

      // Clear saved quiz state and exam data after submission
      localStorage.removeItem('quizState')
      sessionStorage.removeItem('examData')

      // Redirect to results page
      router.push('/quiz-result')
    } else {
      throw new Error(response.message || 'Failed to submit exam')
    }
  } catch (error) {
    console.error('Failed to submit exam:', error)
    alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.')
  } finally {
    isSubmitting.value = false
  }
}

const startTimer = () => {
  quizTimer.value = setInterval(() => {
    // Calculate real-time remaining based on start time
    if (startTime.value) {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime.value) / 1000)
      timeRemaining.value = Math.max(0, totalTime.value - elapsedSeconds)
    } else {
      // Fallback to old method if no start time
      timeRemaining.value--
    }

    saveQuizState() // Save state every second

    if (timeRemaining.value <= 0) {
      // Clear timer first
      if (quizTimer.value) {
        clearInterval(quizTimer.value)
      }

      // Ensure we only submit once on exact timeout
      if (!isAutoSubmitting.value) {
        isAutoSubmitting.value = true
        // Show time up modal briefly then auto-submit
        showTimeUpModal.value = true

        // Automatically call confirmTimeUpSubmit after a short delay to allow user to see modal
        setTimeout(() => {
          // Hide modal and perform submission
          showTimeUpModal.value = false
          confirmTimeUpSubmit()
        }, 1200)
      }
    }
    // Trigger auto-submit a few seconds before time runs out to avoid server-side race
    else if (timeRemaining.value <= autoSubmitBufferSeconds && !isAutoSubmitting.value) {
      // Clear timer to avoid duplicate triggers
      if (quizTimer.value) {
        clearInterval(quizTimer.value)
      }
      // Directly perform the standard submit flow (same as manual submit)
      // performSubmit will set submission flags and redirect on success/failure.
      performSubmit()
      return
    }
  }, 1000)
}

// Prevent text selection and copying
const preventSelection = (e) => {
  e.preventDefault()
  return false
}

const preventCopy = (e) => {
  e.preventDefault()
  alert('Không được phép sao chép nội dung câu hỏi!')
  return false
}

const preventRightClick = (e) => {
  e.preventDefault()
  return false
}

// Lifecycle
onMounted(() => {
  // Check authentication first
  try {
    requireUserAuth()
    console.log('User authenticated for quiz:', getUser())
  } catch (error) {
    console.error('Authentication failed:', error)
    router.push('/')
    return
  }

  // Load exam data from sessionStorage first
  loadExamData()

  // Load saved quiz state after loading exam data (this will calculate real remaining time)
  loadQuizState()

  // Start timer with real-time calculation
  startTimer()

  // Sync time when user comes back to tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && startTime.value) {
      // Recalculate time when tab becomes visible
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime.value) / 1000)
      timeRemaining.value = Math.max(0, totalTime.value - elapsedSeconds)
      console.log('Tab visible - time synced:', {
        elapsed: elapsedSeconds,
        remaining: timeRemaining.value,
      })
    }
  })

  // Disable text selection globally
  document.addEventListener('selectstart', preventSelection)
  document.addEventListener('copy', preventCopy)
  document.addEventListener('contextmenu', preventRightClick)
})

onUnmounted(() => {
  if (quizTimer.value) {
    clearInterval(quizTimer.value)
  }

  // Remove event listeners
  document.removeEventListener('selectstart', preventSelection)
  document.removeEventListener('copy', preventCopy)
  document.removeEventListener('contextmenu', preventRightClick)
  document.removeEventListener('visibilitychange', () => {})
})
</script>

<style scoped>
.quiz-questions {
  min-height: 100vh;
  background: url('../assets/desktopback.png') no-repeat center center fixed;
  background-size: cover;
  padding: 1rem;
  user-select: none; /* Prevent text selection */
}

.timer-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.timer-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.timer {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e53e3e;
  font-family: 'Courier New', monospace;
}

.quiz-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  height: calc(100vh - 8rem);
  max-width: 1400px;
  margin: 0 auto;
}

.questions-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.question-card {
  max-width: 100%;
  flex: 1;
}

.question-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 500;
  cursor: default;
  /* Preserve newlines from data (\n) and wrap long words */
  white-space: pre-line;
  word-break: break-word;
}

.answers-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-option {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.answer-option:has(.answer-radio:checked) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.answer-radio {
  margin: 0;
  transform: scale(1.2);
}

.answer-label {
  flex: 1;
  font-size: 1rem;
  line-height: 1.5;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* Allow answers to show line breaks if present */
  white-space: pre-line;
  word-break: break-word;
}

/* Loading state */
.loading-state {
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

/* Question image */
.question-image {
  margin: 1rem 0;
  text-align: center;
}

.question-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Answer image */
.answer-image {
  max-width: 200px;
  max-height: 100px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #e1e5e9;
}

.nav-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.nav-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #ccc;
}

.nav-btn:disabled:hover {
  background: white;
  color: #ccc;
  transform: none;
  box-shadow: none;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-nav {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.nav-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.question-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-btn.current {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.question-btn.answered {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.question-btn.answered.current {
  border-color: #667eea;
  background: #667eea;
}

.question-btn.unanswered {
  border-color: #e1e5e9;
  background: white;
  color: #666;
}

.question-btn:hover {
  transform: scale(1.05);
}

.submit-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.submit-info {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .quiz-body {
    grid-template-columns: 1fr;
    gap: 1rem;
    height: auto;
    min-height: calc(100vh - 4rem);
  }

  .questions-section {
    padding: 1.2rem;
    order: 1;
  }

  .sidebar {
    order: 2;
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .timer-section {
    flex: 1;
    padding: 1rem;
  }

  .question-nav {
    flex: 1;
  }

  .submit-section {
    flex: 1;
  }

  .question-text {
    font-size: 1.1rem;
  }

  .timer {
    font-size: 1.4rem;
  }

  .question-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.3rem;
  }

  .question-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .nav-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    min-width: 100px;
  }

  .answer-option {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .quiz-questions {
    padding: 0.3rem;
  }

  .quiz-body {
    gap: 0.8rem;
    min-height: calc(100vh - 2rem);
  }

  .sidebar {
    flex-direction: column;
    gap: 0.8rem;
  }

  .timer-section {
    padding: 0.8rem;
  }

  .timer {
    font-size: 1.2rem;
  }

  .timer-label {
    font-size: 0.8rem;
  }

  .questions-section {
    padding: 0.8rem;
  }

  .question-number {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }

  .question-text {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .answer-option {
    padding: 0.6rem;
    margin-bottom: 0.6rem;
  }

  .answer-label {
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .question-navigation {
    padding-top: 1rem;
    gap: 0.8rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    min-width: 80px;
  }

  .question-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 0.2rem;
  }

  .question-btn {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .nav-title {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }

  .question-nav {
    padding: 1rem;
  }

  .submit-section {
    padding: 1rem;
  }

  .submit-btn {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .submit-info {
    font-size: 0.8rem;
  }
}

/* Extra small screens */
@media (max-width: 360px) {
  .quiz-questions {
    padding: 0.2rem;
  }

  .quiz-body {
    gap: 0.5rem;
  }

  .sidebar {
    gap: 0.5rem;
  }

  .timer-section,
  .question-nav,
  .submit-section {
    padding: 0.6rem;
  }

  .questions-section {
    padding: 0.6rem;
  }

  .question-text {
    font-size: 0.9rem;
  }

  .answer-label {
    font-size: 0.8rem;
  }

  .question-grid {
    grid-template-columns: repeat(10, 1fr);
  }

  .question-btn {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }

  .nav-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-width: 70px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.5rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
  color: #374151;
  line-height: 1.6;
}

.modal-body p {
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.modal-body strong {
  color: #dc2626;
  font-weight: 600;
}

.modal-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.confirm-btn {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile modal adjustments */
@media (max-width: 480px) {
  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
    min-width: auto;
  }
}

/* Disable text selection more thoroughly */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input[type='radio'] {
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
}
</style>
