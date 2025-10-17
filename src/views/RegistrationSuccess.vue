<template>
  <div class="registration-success">
    <div class="success-container">
      <div class="success-content">
        <h1 class="success-title">ĐĂNG KÝ THÀNH CÔNG</h1>
        <h2 class="contest-title">CUỘC THI BẢN LĨNH NHÀ ĐẦU TƯ 2025!</h2>

        <p class="confirmation-text">
          Cảm ơn bạn đã hoàn tất đăng ký tham gia
          <strong>Cuộc thi Bản lĩnh Nhà đầu tư 2025</strong>.
        </p>

        <div class="info-content">
          <p class="info-title">Thông tin đăng nhập</p>
          <p class="info-item">
            • Tài khoản và mật khẩu sẽ được BTC gửi về mail mà bạn đã đăng ký.
          </p>
          <p class="info-note">(Vui lòng kiểm tra hộp thư đến và thư mục Spam/Quảng cáo)</p>

          <p class="info-title">Thời gian mở đơn Vòng 1</p>
          <p class="info-item">• Từ <strong>17/10/2025 đến 30/10/2025</strong>.</p>

          <p class="info-title">Lưu ý</p>
          <p class="info-item">• Hãy đăng nhập và tham gia thi trong thời gian quy định.</p>

          <p class="closing-text">
            <em>Chúc bạn hoàn thành thật tốt phần thi của mình và đạt kết quả cao!</em>
          </p>
        </div>

        <div class="action-buttons">
          <RouterLink to="/" class="back-to-login-btn"> Quay lại đăng nhập </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional JavaScript needed for this page
</script>

<style scoped>
.registration-success {
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

.success-container {
  width: 100%;
  max-width: 800px;
}

.success-content {
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
}

.contest-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
}

.confirmation-text {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  line-height: 1.7;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.info-content {
  text-align: left;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.info-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  margin-top: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.info-item {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.info-note {
  font-size: 1rem;
  font-style: italic;
  color: #e5e7eb;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.closing-text {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.6;
}

.action-buttons {
  margin-top: 3rem;
}

.back-to-login-btn {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.back-to-login-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .registration-success {
    padding: 1rem;
  }

  .success-content {
    padding: 1.5rem;
  }

  .success-title {
    font-size: 2rem;
  }

  .contest-title {
    font-size: 1.4rem;
  }

  .confirmation-text {
    font-size: 1.1rem;
  }

  .info-title {
    font-size: 1.2rem;
  }

  .info-item {
    font-size: 1rem;
  }

  .closing-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .success-content {
    padding: 1rem;
  }

  .success-title {
    font-size: 1.6rem;
  }

  .contest-title {
    font-size: 1.2rem;
  }

  .confirmation-text {
    font-size: 1rem;
  }

  .info-title {
    font-size: 1.1rem;
  }

  .info-item {
    font-size: 0.95rem;
  }

  .back-to-login-btn {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }
}
</style>
