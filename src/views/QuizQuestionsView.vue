<template>
  <div class="quiz-questions">
    <div class="quiz-body">
      <!-- Left side - Questions -->
      <div class="questions-section">
        <div class="question-card">
          <div class="question-number">Câu {{ currentQuestion + 1 }}:</div>
          <div
            class="question-text"
            @selectstart="preventSelection"
            @copy="preventCopy"
            @contextmenu="preventRightClick"
          >
            {{ questions[currentQuestion].question }}
          </div>

          <div class="answers-section">
            <div
              v-for="(answer, index) in questions[currentQuestion].answers"
              :key="index"
              class="answer-option"
              @click="selectAnswer(index)"
            >
              <input
                type="radio"
                :id="`answer-${index}`"
                :name="`question-${currentQuestion}`"
                :value="index"
                v-model="userAnswers[currentQuestion]"
                class="answer-radio"
              />
              <label :for="`answer-${index}`" class="answer-label">
                {{ String.fromCharCode(65 + index) }}. {{ answer }}
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
          <button @click="submitQuiz" class="submit-btn">NỘP BÀI</button>
          <div class="submit-info">
            Đã hoàn thành: {{ answeredCount }}/{{ questions.length }} câu
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Quiz state
const currentQuestion = ref(0)
const userAnswers = ref(Array(20).fill(null))
const timeRemaining = ref(20 * 60) // 20 minutes in seconds
const quizTimer = ref(null)

// Load saved data from localStorage
const loadQuizState = () => {
  const savedState = localStorage.getItem('quizState')
  if (savedState) {
    const state = JSON.parse(savedState)
    currentQuestion.value = state.currentQuestion || 0
    userAnswers.value = state.userAnswers || Array(20).fill(null)
    timeRemaining.value = state.timeRemaining || 20 * 60
  }
}

// Save quiz state to localStorage
const saveQuizState = () => {
  const state = {
    currentQuestion: currentQuestion.value,
    userAnswers: userAnswers.value,
    timeRemaining: timeRemaining.value,
    lastSaved: Date.now(),
  }
  localStorage.setItem('quizState', JSON.stringify(state))
}

// Sample questions - trong thực tế sẽ lấy từ API
const questions = ref([
  {
    question: 'Thời gian nắm giữ vốn đối với quyết định đầu tư dài hạn như thế nào?',
    answers: ['Từ 1 năm', 'Từ 3 năm', 'Từ 5 năm', 'Không hạn chế theo thời gian'],
  },
  {
    question: 'Yếu tố ảnh hưởng đến giá trị thị trường và việc đầu tư doanh nghiệp hiện tại?',
    answers: ['Pháp luật', 'Kỹ thuật', 'Thông tin', 'Tất cả đều đúng'],
  },
  {
    question:
      'Thông tin định lượng thường phản ánh điều gì về thị trường, việc đầu tư hay không được chia sẻ với công ty cụ thể cho thấy ở phần nào?',
    answers: [
      'Báo cáo tài chính của các doanh nghiệp',
      'Báo cáo thường niên',
      'Báo cáo tài chính doanh nghiệp',
      'Báo cáo về tình hình tài chính',
    ],
  },
  // Add more questions as needed... for demo, I'll create 20 sample questions
  ...Array.from({ length: 17 }, (_, i) => ({
    question: `Câu hỏi mẫu số ${i + 4} về kinh tế, tài chính, hoặc IQ. Đây là nội dung câu hỏi để test giao diện?`,
    answers: [
      `Đáp án A cho câu ${i + 4}`,
      `Đáp án B cho câu ${i + 4}`,
      `Đáp án C cho câu ${i + 4}`,
      `Đáp án D cho câu ${i + 4}`,
    ],
  })),
])

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
  userAnswers.value[currentQuestion.value] = answerIndex
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

const submitQuiz = () => {
  const unansweredQuestions = userAnswers.value.filter((answer) => answer === null).length

  if (unansweredQuestions > 0) {
    const confirm = window.confirm(
      `Bạn còn ${unansweredQuestions} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
    )
    if (!confirm) return
  }

  // Clear timer
  if (quizTimer.value) {
    clearInterval(quizTimer.value)
  }

  // Save quiz results for potential review
  const quizResults = {
    userAnswers: userAnswers.value,
    answeredCount: answeredCount.value,
    totalQuestions: questions.value.length,
    submissionTime: new Date().toISOString(),
  }
  localStorage.setItem('quizResults', JSON.stringify(quizResults))

  // Clear saved quiz state after submission
  localStorage.removeItem('quizState')

  // Redirect to results page
  router.push('/quiz-result')
}

const startTimer = () => {
  quizTimer.value = setInterval(() => {
    timeRemaining.value--
    saveQuizState() // Save time every second

    if (timeRemaining.value <= 0) {
      // Auto submit when time is up
      alert('Hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.')

      // Clear timer
      if (quizTimer.value) {
        clearInterval(quizTimer.value)
      }

      // Save quiz results for potential review
      const quizResults = {
        userAnswers: userAnswers.value,
        answeredCount: answeredCount.value,
        totalQuestions: questions.value.length,
        submissionTime: new Date().toISOString(),
        autoSubmitted: true,
      }
      localStorage.setItem('quizResults', JSON.stringify(quizResults))

      // Clear saved quiz state after submission
      localStorage.removeItem('quizState')

      // Redirect to results page
      router.push('/quiz-result')
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
  // Load saved quiz state first
  loadQuizState()

  startTimer()

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
})
</script>

<style scoped>
.quiz-questions {
  min-height: 100vh;
  background: url('../assets/desktopback.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
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

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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
