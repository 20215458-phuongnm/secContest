# API Client Usage Examples

## Import APIs in your Vue components

### Method 1: Import individual APIs

```javascript
import { authApi, examApi, questionApi } from '@/api'

// Or import specific API
import authApi from '@/api/authApi.js'
```

### Method 2: Import all APIs

```javascript
import api from '@/api'

// Use like: api.auth.login(), api.exam.startExam(), etc.
```

## Usage Examples

### Authentication

```javascript
// Admin Login
try {
  const response = await authApi.login({
    username: 'admin',
    password: 'Admin@123',
  })

  // Store token
  localStorage.setItem('token', response.token)
  localStorage.setItem('refreshToken', response.refreshToken)

  console.log('Login successful:', response)
} catch (error) {
  console.error('Login failed:', error)
}

// Logout
await authApi.logout()

// Refresh token
const refreshToken = localStorage.getItem('refreshToken')
const newTokens = await authApi.refreshToken(refreshToken)

// Create admin user
await authApi.createAdmin({
  fullName: 'Admin User',
  email: 'admin@example.com',
  username: 'admin123',
  password: 'SecurePass123',
})

// User registration (BA students)
await authApi.register({
  fullName: 'Nguyễn Văn A',
  dateOfBirth: '2000-01-15',
  email: 'nguyenvana@example.com',
  phoneNumber: '0912345678',
  university: 'BA - Học viện Ngân hàng',
  studentId: '2001234567',
  major: 'Công nghệ thông tin',
  className: 'D22CQCN01-B',
  yearOfStudy: 3,
  facebookLink: 'https://facebook.com/nguyenvana',
})

// User registration (Other university)
await authApi.register({
  fullName: 'Trần Thị B',
  dateOfBirth: '2001-05-20',
  email: 'tranthib@example.com',
  phoneNumber: '0987654321',
  university: 'Trường khác',
  otherUniversity: 'Đại học Bách Khoa Hà Nội',
})
```

### Exam Management

```javascript
// Start exam
const exam = await examApi.startExam()

// Get questions
const questions = await examApi.getExamQuestions()

// Submit answer
await examApi.submitAnswer({
  questionId: '123',
  answerId: '456',
})

// Finish exam
const results = await examApi.finishExam()
```

### Question Management

```javascript
// Get all questions
const questions = await questionApi.getQuestions({
  page: 1,
  limit: 10,
  isActive: true,
})

// Create question
const newQuestion = await questionApi.createQuestion({
  content: 'TCP là gì?',
  imageUrl: 'https://example.com/image.png',
  isActive: true,
  answers: [
    { content: 'Transmission Control Protocol', isCorrect: true, order: 1 },
    { content: 'Transfer Control Protocol', isCorrect: false, order: 2 },
  ],
})

// Update question
await questionApi.updateQuestion('123', updatedData)

// Delete question
await questionApi.deleteQuestion('123')
```

### Error Handling

```javascript
// Global error handling is done in axiosClient.js
// But you can also handle specific errors:

try {
  await questionApi.createQuestion(questionData)
} catch (error) {
  if (error.includes('validation')) {
    // Handle validation error
  } else if (error.includes('unauthorized')) {
    // Handle auth error
  }
}
```

### File Upload

```javascript
// Upload question image
const fileInput = document.querySelector('#imageFile')
const file = fileInput.files[0]

const response = await questionApi.uploadQuestionImage(file)
console.log('Image URL:', response.imageUrl)
```
