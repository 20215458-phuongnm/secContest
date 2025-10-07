# API Documentation

This folder contains API testing files for the Security Contest application.

## Files Structure

### 📁 API Files

- `auth.http` - Authentication APIs (login, logout)
- `exam.http` - Exam management APIs (start, questions, answers, finish)
- `questions.http` - Questions management APIs (CRUD operations)
- `curl-commands.md` - cURL commands for terminal testing
- `.env.example` - Environment variables template

## How to Use

### Using VS Code REST Client Extension

1. Install the "REST Client" extension in VS Code
2. Open any `.http` file
3. Click "Send Request" above each API call
4. Update the `{{token}}` variable after login

### Using cURL Commands

1. Copy commands from `curl-commands.md`
2. Replace `{{token}}` with actual JWT token
3. Run in terminal/command prompt

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update values as needed
3. Use environment variables in your API calls

## Authentication Flow

1. Login using `/auth/login` to get JWT token
2. Use token in `Authorization: Bearer {{token}}` header for protected routes
3. Token expires after certain time, re-login if needed

## Common Endpoints

- `POST /auth/login` - Admin login
- `POST /exam/start` - Start new exam
- `GET /questions` - Get all questions
- `POST /questions` - Create new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

## Sample Data

The files include sample question data for testing:

- TCP networking question
- Multiple choice answers with correct/incorrect flags
- Image URL for visual questions
- Active/inactive status

## Tips

- Always authenticate first to get token
- Replace placeholder values (`{{token}}`, `{{questionId}}`) with actual values
- Check server is running on correct port (default: 3000)
- Use proper Content-Type headers for JSON requests
