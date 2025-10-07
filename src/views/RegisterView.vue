<template>
  <div class="student-register">
    <div class="register-container">
      <div class="register-form">
        <h1 class="register-title">ĐĂNG KÝ</h1>
        <div class="title-underline"></div>

        <form @submit.prevent="handleRegister" class="form">
          <!-- Row 1: Họ và Tên -->
          <div class="form-group full-width">
            <label for="fullName">Họ và Tên:</label>
            <v-text-field
              id="fullName"
              v-model="form.fullName"
              placeholder="Nhập họ và tên đầy đủ"
              required
              :error-messages="errors.fullName"
              variant="outlined"
              density="comfortable"
              class="vuetify-input"
            ></v-text-field>
          </div>

          <!-- Row 2: Khu vực & Ngày sinh -->
          <div class="form-row">
            <div class="form-group">
              <label for="birthDate">Ngày sinh:</label>
              <v-text-field
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                required
                :error-messages="errors.birthDate"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
          </div>

          <!-- Row 3: Email & Số điện thoại -->
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email:</label>
              <v-text-field
                id="email"
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                required
                :error-messages="errors.email"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
            <div class="form-group">
              <label for="phone">Số điện thoại:</label>
              <v-text-field
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="0xxx xxx xxx"
                required
                :error-messages="errors.phone"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
          </div>

          <!-- Row 4: Bạn là sinh viên trường nào -->
          <div class="form-group full-width">
            <label for="university">Bạn là sinh viên trường nào?</label>
            <div class="university-input-container">
              <v-select
                v-if="!showCustomUniversity"
                id="university"
                v-model="form.university"
                :items="universityItems"
                placeholder="Chọn trường"
                required
                :error-messages="errors.university"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
                @update:model-value="handleUniversityChange"
              ></v-select>

              <v-text-field
                v-if="showCustomUniversity"
                id="customUniversity"
                v-model="form.customUniversity"
                placeholder="Nhập tên trường của bạn"
                required
                :error-messages="errors.university"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
                append-inner-icon="mdi-arrow-left"
                @click:append-inner="backToSelect"
              ></v-text-field>
            </div>
          </div>

          <!-- Row 5: Info text - Only show for universities other than "Trường khác" -->
          <div v-if="!showCustomUniversity" class="info-text">
            Nếu bạn là <strong>Sinh viên tại các trường</strong> nêu trên, vui lòng điền:
          </div>

          <!-- Row 6: Mã sinh viên & Ngành học - Only show for universities other than "Trường khác" -->
          <div v-if="!showCustomUniversity" class="form-row">
            <div class="form-group">
              <label for="studentId">Mã sinh viên:</label>
              <v-text-field
                id="studentId"
                v-model="form.studentId"
                placeholder="Nhập mã sinh viên"
                required
                :error-messages="errors.studentId"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
            <div class="form-group">
              <label for="major">Ngành học của bạn:</label>
              <v-text-field
                id="major"
                v-model="form.major"
                placeholder="Tên ngành học"
                required
                :error-messages="errors.major"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
          </div>

          <!-- Row 7: Lớp học phần & Bạn là sinh viên năm - Only show for universities other than "Trường khác" -->
          <div v-if="!showCustomUniversity" class="form-row">
            <div class="form-group">
              <label for="classCode">Lớp học phần:</label>
              <v-text-field
                id="classCode"
                v-model="form.classCode"
                placeholder="Mã lớp học phần"
                required
                :error-messages="errors.classCode"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
            <div class="form-group">
              <label for="year">Bạn là sinh viên năm:</label>
              <v-select
                id="year"
                v-model="form.year"
                :items="yearItems"
                placeholder="Chọn năm"
                required
                :error-messages="errors.year"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-select>
            </div>
          </div>

          <!-- Row 8: Link Facebook - Only show for universities other than "Trường khác" -->
          <div v-if="!showCustomUniversity" class="form-row">
            <div class="form-group">
              <label for="facebook">Link Facebook:</label>
              <v-text-field
                id="facebook"
                v-model="form.facebook"
                placeholder="https://facebook.com/yourprofile"
                type="url"
                :error-messages="errors.facebook"
                variant="outlined"
                density="comfortable"
                class="vuetify-input"
              ></v-text-field>
            </div>
          </div>

          <button type="submit" class="register-btn" :disabled="loading">
            <span v-if="loading">Đang đăng ký...</span>
            <span v-else>Đăng ký</span>
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>
        </form>

        <div class="login-link-container">
          <RouterLink to="/" class="login-link"> ← Quay lại đăng nhập </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi.js'

const router = useRouter()

// Form data
const form = ref({
  fullName: '',
  region: '',
  birthDate: '',
  email: '',
  phone: '',
  university: '',
  customUniversity: '',
  studentId: '',
  major: '',
  year: '',
  classCode: '',
  idCard: '',
  facebook: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const errors = ref({})
const showCustomUniversity = ref(false)

// Vuetify select items
const regionItems = [
  { title: 'Miền Bắc', value: 'Miền Bắc' },
  { title: 'Miền Trung', value: 'Miền Trung' },
  { title: 'Miền Nam', value: 'Miền Nam' },
]

const universityItems = [
  { title: 'BA - Học viện Ngân hàng', value: 'BA - Học viện Ngân hàng' },
  { title: 'FTU - Đại học Ngoại thương', value: 'FTU - Đại học Ngoại thương' },
  { title: 'NEU - Đại học Kinh tế Quốc Dân', value: 'NEU - Đại học Kinh tế Quốc Dân' },
  { title: 'AOF - Học viện Tài chính', value: 'AOF - Học viện Tài chính' },
  {
    title: 'UEB - Trường Đại học Kinh tế - Đại học Quốc gia Hà Nội',
    value: 'UEB - Trường Đại học Kinh tế - Đại học Quốc gia Hà Nội',
  },
  { title: 'TMU - Đại học Thương mại', value: 'TMU - Đại học Thương mại' },
  {
    title: 'FTU2 - Trường Đại học Ngoại Thương cơ sở II',
    value: 'FTU2 - Trường Đại học Ngoại Thương cơ sở II',
  },
  { title: 'UEH - Trường Đại học Kinh tế TP.HCM', value: 'UEH - Trường Đại học Kinh tế TP.HCM' },
  {
    title: 'HUB - Trường Đại học Ngân hàng TP.HCM',
    value: 'HUB - Trường Đại học Ngân hàng TP.HCM',
  },
  {
    title: 'UEL - Trường Đại học Kinh tế - Luật - Đại học Quốc gia TP.HCM',
    value: 'UEL - Trường Đại học Kinh tế - Luật - Đại học Quốc gia TP.HCM',
  },
  {
    title: 'UEF - Trường Đại học Kinh tế - Tài chính TP.HCM',
    value: 'UEF - Trường Đại học Kinh tế - Tài chính TP.HCM',
  },
  { title: 'RMIT - Trường Đại học RMIT', value: 'RMIT - Trường Đại học RMIT' },
  { title: 'Trường khác', value: 'other' },
]

const yearItems = [
  { title: 'Năm 1', value: '1' },
  { title: 'Năm 2', value: '2' },
  { title: 'Năm 3', value: '3' },
  { title: 'Năm 4', value: '4' },
  { title: 'Năm 5', value: '5' },
]

// Handle university change
const handleUniversityChange = () => {
  if (form.value.university === 'other') {
    showCustomUniversity.value = true
    form.value.university = ''
    // Clear student fields when switching to "Trường khác"
    form.value.studentId = ''
    form.value.major = ''
    form.value.classCode = ''
    form.value.year = ''
    form.value.facebook = ''
  } else {
    form.value.customUniversity = ''
    showCustomUniversity.value = false
  }
}

// Back to select
const backToSelect = () => {
  showCustomUniversity.value = false
  form.value.university = ''
  form.value.customUniversity = ''
  // Clear student fields when going back to select
  form.value.studentId = ''
  form.value.major = ''
  form.value.classCode = ''
  form.value.year = ''
  form.value.facebook = ''
}

// Validation
const validateForm = () => {
  errors.value = {}

  // Required fields for all users
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Vui lòng nhập họ và tên'
  }

  if (!form.value.birthDate) {
    errors.value.birthDate = 'Vui lòng chọn ngày sinh'
  }

  if (!form.value.email.includes('@')) {
    errors.value.email = 'Email không hợp lệ'
  }

  if (!form.value.phone.match(/^[0-9]{10,11}$/)) {
    errors.value.phone = 'Số điện thoại không hợp lệ'
  }

  // University validation
  if (showCustomUniversity.value && !form.value.customUniversity.trim()) {
    errors.value.university = 'Vui lòng nhập tên trường'
  } else if (!showCustomUniversity.value && !form.value.university) {
    errors.value.university = 'Vui lòng chọn trường'
  }

  // Required fields for students at specific universities (not "Trường khác")
  if (!showCustomUniversity.value) {
    // These fields are required for all universities except "Trường khác"
    if (!form.value.studentId.trim()) {
      errors.value.studentId = 'Vui lòng nhập mã sinh viên'
    }

    if (!form.value.major.trim()) {
      errors.value.major = 'Vui lòng nhập ngành học'
    }

    if (!form.value.classCode.trim()) {
      errors.value.classCode = 'Vui lòng nhập lớp học phần'
    }

    if (!form.value.year) {
      errors.value.year = 'Vui lòng chọn năm học'
    }
  }

  // Facebook link validation (optional but if provided must be valid)
  if (form.value.facebook && !form.value.facebook.includes('facebook.com')) {
    errors.value.facebook = 'Link Facebook không hợp lệ'
  }

  return Object.keys(errors.value).length === 0
}

// Handle register
const handleRegister = async () => {
  if (!validateForm()) {
    error.value = 'Vui lòng kiểm tra lại thông tin đã nhập'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    // Prepare registration data
    const registrationData = {
      fullName: form.value.fullName.trim(),
      dateOfBirth: form.value.birthDate,
      email: form.value.email.trim(),
      phoneNumber: form.value.phone.trim(),
    }

    // Handle university selection
    if (showCustomUniversity.value && form.value.customUniversity) {
      // For "Trường khác" - only send basic info
      registrationData.university = 'Trường khác'
      registrationData.otherUniversity = form.value.customUniversity.trim()
    } else {
      // For specific universities - send full student info
      registrationData.university = form.value.university
      registrationData.studentId = form.value.studentId.trim()
      registrationData.major = form.value.major.trim()
      registrationData.className = form.value.classCode.trim()
      registrationData.yearOfStudy = parseInt(form.value.year)
    }

    // Add optional facebook link
    if (form.value.facebook && form.value.facebook.trim()) {
      registrationData.facebookLink = form.value.facebook.trim()
    }

    // Debug log
    console.log('Registration data:', registrationData)

    // Call registration API
    const response = await authApi.register(registrationData)

    loading.value = false
    success.value = 'Đăng ký thành công!'

    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push('/registration-success')
    }, 1500)
  } catch (err) {
    loading.value = false
    console.error('Registration error:', err)

    // Handle different error types
    if (err && err.errors && Array.isArray(err.errors)) {
      // Display validation errors from API
      error.value = err.errors.join(', ')
    } else if (err && err.message) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!'
    }
  }
}
</script>

<style scoped>
.student-register {
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

.register-container {
  width: 100%;
  max-width: 900px;
}

.register-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.register-title {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  margin: 0 auto 2.5rem auto;
  border-radius: 2px;
}

.form {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

/* Show labels for form groups */
.form-group label {
  display: block !important;
}

.info-text {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #4c51bf;
  text-align: center;
}

.info-text strong {
  color: #553c9a;
}

/* Vuetify component styling */
.vuetify-input {
  margin-bottom: 0;
  width: 100%;
}

.vuetify-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  min-height: 56px;
  height: 56px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.vuetify-input :deep(.v-field--focused) {
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.vuetify-input :deep(.v-field__outline) {
  --v-field-border-width: 2px;
  --v-field-border-opacity: 1;
}

.vuetify-input :deep(.v-field__outline__start),
.vuetify-input :deep(.v-field__outline__end),
.vuetify-input :deep(.v-field__outline__notch:before),
.vuetify-input :deep(.v-field__outline__notch:after) {
  border-color: #e1e5e9 !important;
  border-style: solid;
}

.vuetify-input :deep(.v-field--focused .v-field__outline__start),
.vuetify-input :deep(.v-field--focused .v-field__outline__end),
.vuetify-input :deep(.v-field--focused .v-field__outline__notch:before),
.vuetify-input :deep(.v-field--focused .v-field__outline__notch:after) {
  border-color: #667eea !important;
}

.vuetify-input :deep(.v-field__input) {
  padding: 1rem;
  color: #2c3e50;
  min-height: 24px;
  align-items: center;
  font-weight: 500;
}

.vuetify-input :deep(.v-field__append-inner) {
  padding-right: 1rem;
  align-items: center;
}

.vuetify-input :deep(.v-select__selection-text) {
  color: #2c3e50;
  font-weight: 500;
}

.vuetify-input :deep(.v-field--error .v-field__outline__start),
.vuetify-input :deep(.v-field--error .v-field__outline__end),
.vuetify-input :deep(.v-field--error .v-field__outline__notch:before),
.vuetify-input :deep(.v-field--error .v-field__outline__notch:after) {
  border-color: #e53e3e !important;
}

.vuetify-input :deep(.v-label) {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.vuetify-input :deep(.v-label--active) {
  color: #667eea;
  font-size: 0.8rem;
}

/* Remove any unwanted borders from Material Design icons */
.vuetify-input :deep(.v-icon) {
  border: none !important;
}

/* Ensure consistent styling for all field variants */
.vuetify-input :deep(.v-field--variant-outlined) {
  background: rgba(255, 255, 255, 0.95);
}

.vuetify-input :deep(.v-field--variant-outlined.v-field--focused) {
  background: white;
}

/* Remove all unwanted borders and outlines globally for Vuetify inputs */
.vuetify-input :deep(*) {
  border-image: none !important;
}

.vuetify-input :deep(.v-field__outline__notch) {
  border: none !important;
  border-image: none !important;
}

.vuetify-input :deep(.v-field__outline__notch::before),
.vuetify-input :deep(.v-field__outline__notch::after) {
  border-color: #e1e5e9 !important;
  border-image: none !important;
}

.vuetify-input :deep(.v-field--focused .v-field__outline__notch::before),
.vuetify-input :deep(.v-field--focused .v-field__outline__notch::after) {
  border-color: #667eea !important;
}

.university-input-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: stretch;
}

.university-input-container .vuetify-input {
  flex: 1;
}

/* Fade in animation for Vuetify components */
.university-input-container .vuetify-input {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #e53e3e;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(229, 62, 62, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(229, 62, 62, 0.2);
}

.success-message {
  color: #047857;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.login-link-container {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link:hover {
  color: #5a67d8;
}

@media (max-width: 768px) {
  .student-register {
    padding: 1rem;
  }

  .register-form {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    max-width: 100%;
  }

  .register-form {
    padding: 1.5rem 1rem;
  }

  .register-title {
    font-size: 1.5rem;
  }
}
</style>
