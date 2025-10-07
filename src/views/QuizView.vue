<template>
  <div class="quiz-intro">
    <div class="quiz-container">
      <div class="quiz-content">
        <h1 class="main-title">CHÀO MỪNG BẠN ĐẾN VỚI VÒNG THI TEST ONLINE</h1>
        <h2 class="contest-title">CUỘC THI BẢN LĨNH NHÀ ĐẦU TƯ 2025!</h2>

        <div class="quiz-info">
          <p class="description">
            Thể lệ Bài thi gồm <strong>20 câu trắc nghiệm A-B-C-D</strong> về các lĩnh vực
            <strong>Kinh tế, Tài chính, IQ</strong>... Ở mỗi câu hỏi, các thí sinh chỉ được lựa chọn
            <strong>01 đáp án duy nhất</strong>.
          </p>

          <p class="total-score">
            <strong>Tổng điểm bài thi: 20 điểm</strong>
          </p>

          <p class="time-limit">
            <em>Thời gian làm bài: 20 phút</em>
          </p>

          <p class="encouragement">Chúc bạn hoàn thành tốt bài thi của mình!</p>
        </div>

        <div class="action-section">
          <button @click="startQuiz" class="start-quiz-btn">VÀO THI</button>
        </div>

        <div class="navigation-section">
          <button @click="logout" class="logout-btn">← Đăng xuất</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { requireUserAuth, performLogout, getUser } from '@/utils/auth.js'

const router = useRouter()

// Check authentication on component mount
onMounted(() => {
  try {
    requireUserAuth()
    console.log('User authenticated:', getUser())
  } catch (error) {
    console.error('Authentication failed:', error)
    router.push('/')
  }
})

const startQuiz = () => {
  // Chuyển đến trang làm bài thi
  router.push('/quiz-questions')
}

const logout = async () => {
  // Call logout API and clear auth
  await performLogout()

  // Redirect to login
  router.push('/')
}
</script>

<style scoped>
.quiz-intro {
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

.quiz-container {
  width: 100%;
  max-width: 900px;
}

.quiz-content {
  text-align: center;
  color: white;
  padding: 3rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
  line-height: 1.2;
}

.contest-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
  color: white;
}

.quiz-info {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.description {
  font-size: 1.3rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.total-score {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.time-limit {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.encouragement {
  font-size: 1.2rem;
  font-style: italic;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.6;
}

.action-section {
  margin-bottom: 3rem;
}

.start-quiz-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.start-quiz-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.navigation-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 2rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .quiz-intro {
    padding: 1rem;
  }

  .quiz-content {
    padding: 2rem 1.5rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .contest-title {
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }

  .quiz-info {
    padding: 2rem;
  }

  .description {
    font-size: 1.1rem;
  }

  .total-score {
    font-size: 1.2rem;
  }

  .time-limit {
    font-size: 1.1rem;
  }

  .encouragement {
    font-size: 1.1rem;
  }

  .start-quiz-btn {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .quiz-content {
    padding: 1.5rem 1rem;
  }

  .main-title {
    font-size: 1.6rem;
  }

  .contest-title {
    font-size: 1.2rem;
  }

  .quiz-info {
    padding: 1.5rem;
  }

  .description {
    font-size: 1rem;
  }

  .total-score {
    font-size: 1.1rem;
  }

  .time-limit {
    font-size: 1rem;
  }

  .encouragement {
    font-size: 1rem;
  }

  .start-quiz-btn {
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
  }

  .logout-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>
