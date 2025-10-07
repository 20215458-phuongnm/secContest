# cURL Commands for API Testing

## Authentication

```bash
# Login Admin
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "username": "admin",
  "password": "Admin@123"
}'
```

## Exam Management

```bash
# Start Exam
curl --location --request POST 'http://localhost:3000/exam/start' \
--header 'Authorization: Bearer {{token}}'

# Get Exam Questions
curl --location 'http://localhost:3000/exam/questions' \
--header 'Authorization: Bearer {{token}}'
```

## Questions Management

```bash
# Get All Questions
curl --location 'http://localhost:3000/questions' \
--header 'Authorization: Bearer {{token}}'

# Create New Question
curl --location 'http://localhost:3000/questions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data '{
  "content": "TCP là gì?",
  "imageUrl": "https://sec-com.s3.ap-southeast-1.amazonaws.com/questions/1759821600688-icon.png",
  "isActive": true,
  "answers": [
    {
      "content": "Transmission Control Protocol",
      "isCorrect": true,
      "order": 1
    },
    {
      "content": "Transfer Control Protocol",
      "isCorrect": false,
      "order": 2
    },
    {
      "content": "Transport Communication Protocol",
      "isCorrect": false,
      "order": 3
    },
    {
      "content": "Technical Control Protocol",
      "isCorrect": false,
      "order": 4
    }
  ]
}'

# Update Question
curl --location --request PUT 'http://localhost:3000/questions/{{questionId}}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data '{
  "content": "Updated question content",
  "imageUrl": "https://example.com/image.png",
  "isActive": true,
  "answers": [
    {
      "content": "Answer 1",
      "isCorrect": true,
      "order": 1
    },
    {
      "content": "Answer 2",
      "isCorrect": false,
      "order": 2
    }
  ]
}'

# Delete Question
curl --location --request DELETE 'http://localhost:3000/questions/{{questionId}}' \
--header 'Authorization: Bearer {{token}}'
```

## Notes

- Replace `{{token}}` with actual JWT token after login
- Replace `{{questionId}}` with actual question ID
- Server should be running on `http://localhost:3000`
