<template>
  <div class="quiz-result">
    <div class="result-container">
      <div class="result-content">
        <h1 class="success-title">CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH BÀI THI CỦA VÒNG 1 - TEST ONLINE</h1>
        <h2 class="contest-title">CUỘC THI BẢN LĨNH NHÀ ĐẦU TƯ 2025</h2>

        <p class="confirmation-text">
          Kết quả của bạn sẽ được BTC cập nhật sớm nhất qua email của bạn.
        </p>

        <div class="info-content">
          <p class="info-title">Vòng 2 Bản Lĩnh Nhà Đầu Tư 2025 sẽ gồm các ca thi sau:</p>

          <div class="schedule-box">
            <div class="schedule-item">CA 1: 08h30 - 09h30 ngày 26/10/2025</div>
            <div class="schedule-item">CA 2: 10h15 - 11h15 ngày 26/10/2025</div>
            <div class="schedule-item">CA 3: 14h00 - 15h00 ngày 26/10/2025</div>
            <div class="schedule-item">CA 4: 15h45 - 16h45 ngày 26/10/2025</div>
          </div>

          <p class="closing-text">
            <em>Hẹn gặp lại bạn ở Vòng 2: Test sơ loại Cuộc thi Bản lĩnh nhà đầu tư 2025!</em>
          </p>
        </div>
        <div class="action-buttons">
          <button @click="goHome" class="back-to-login-btn">HOÀN THÀNH</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { requireUserAuth, performLogout, getUser } from '@/utils/auth.js'

const router = useRouter()

// Check authentication on component mount
onMounted(() => {
  try {
    requireUserAuth()
    console.log('User authenticated for results:', getUser())
  } catch (error) {
    console.error('Authentication failed:', error)
    router.push('/')
  }
})

const goHome = async () => {
  // Clear any remaining quiz data
  localStorage.removeItem('quizState')
  localStorage.removeItem('userRegistration')

  // Call logout API and clear auth
  await performLogout()

  // Redirect to login
  router.push('/')
}
</script>

<style scoped>
.quiz-result {
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

.result-container {
  width: 100%;
  max-width: 800px;
}

.result-content {
  text-align: center;
  color: white;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.success-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
}

.contest-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
}

.confirmation-text {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.info-content {
  text-align: left;
  margin-bottom: 1.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.info-item {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.schedule-box {
  background: linear-gradient(135deg, rgba(30, 50, 80, 0.95), rgba(15, 30, 50, 0.98));
  border: 3px solid transparent;
  border-radius: 25px;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: center;
  backdrop-filter: blur(15px);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.schedule-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.3), rgba(64, 149, 246, 0.1));
  border-radius: 30px;
  padding: 3px;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  z-index: -1;
}

.schedule-box:hover {
  transform: translateY(-3px);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.schedule-item {
  font-size: 0.95rem;
  color: #ffffff;
  margin-bottom: 0.6rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 181, 246, 0.2);
  border-radius: 12px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.schedule-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(100, 181, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.schedule-item:hover {
  background: rgba(100, 181, 246, 0.1);
  border-color: rgba(100, 181, 246, 0.4);
  transform: translateX(5px);
}

.schedule-item:hover::before {
  left: 100%;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.closing-text {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.action-buttons {
  margin-top: 1.5rem;
}

.back-to-login-btn {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.back-to-login-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .quiz-result {
    padding: 0.5rem;
  }

  .result-content {
    padding: 0.8rem;
  }

  .success-title {
    font-size: 1.4rem;
  }

  .contest-title {
    font-size: 1.1rem;
  }

  .confirmation-text {
    font-size: 0.9rem;
  }

  .info-title {
    font-size: 1rem;
  }

  .schedule-box {
    padding: 1.2rem;
    margin: 0.8rem 0;
  }

  .schedule-item {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.8rem;
  }

  .closing-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .result-content {
    padding: 0.5rem;
  }

  .success-title {
    font-size: 1.2rem;
  }

  .contest-title {
    font-size: 1rem;
  }

  .confirmation-text {
    font-size: 0.85rem;
  }

  .info-title {
    font-size: 0.95rem;
  }

  .schedule-box {
    padding: 1rem;
    margin: 0.5rem 0;
  }

  .schedule-item {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
    padding: 0.4rem 0.6rem;
  }

  .back-to-login-btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>
