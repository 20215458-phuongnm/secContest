// Ví dụ sử dụng Question API

import questionApi from './questionApi.js'

// Example: Upload image
export const uploadImageExample = async (imageFile) => {
  try {
    const response = await questionApi.uploadQuestionImage(imageFile)
    console.log('Image uploaded successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Upload image failed:', error)
    throw error
  }
}

// Example: Create question với full data
export const createQuestionExample = async () => {
  const questionData = {
    content: 'TCP là gì?',
    imageUrl: 'https://sec-com.s3.ap-southeast-1.amazonaws.com/questions/1759821600688-icon.png',
    isActive: true,
    answers: [
      {
        content: 'Transmission Control Protocol',
        isCorrect: true,
        order: 1,
      },
      {
        content: 'Transfer Control Protocol',
        isCorrect: false,
        order: 2,
      },
      {
        content: 'Transport Communication Protocol',
        isCorrect: false,
        order: 3,
      },
      {
        content: 'Technical Control Protocol',
        isCorrect: false,
        order: 4,
      },
    ],
  }

  try {
    const response = await questionApi.createQuestion(questionData)
    console.log('Question created successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Create question failed:', error)
    throw error
  }
}

// Example: Partial update question
export const updateQuestionExample = async (questionId) => {
  const updateData = {
    content: 'TCP là gì? (Updated)',
  }

  try {
    const response = await questionApi.patchQuestion(questionId, updateData)
    console.log('Question updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Update question failed:', error)
    throw error
  }
}

// Example: Complete workflow - Upload image then create question
export const completeWorkflowExample = async (imageFile) => {
  try {
    // 1. Upload image first
    const imageUploadResponse = await questionApi.uploadQuestionImage(imageFile)
    const imageUrl = imageUploadResponse.data.url // Assuming API returns url field

    // 2. Create question with uploaded image
    const questionData = {
      content: 'Câu hỏi mới với hình ảnh',
      imageUrl: imageUrl,
      isActive: true,
      answers: [
        {
          content: 'Đáp án đúng',
          isCorrect: true,
          order: 1,
        },
        {
          content: 'Đáp án sai 1',
          isCorrect: false,
          order: 2,
        },
        {
          content: 'Đáp án sai 2',
          isCorrect: false,
          order: 3,
        },
        {
          content: 'Đáp án sai 3',
          isCorrect: false,
          order: 4,
        },
      ],
    }

    const questionResponse = await questionApi.createQuestion(questionData)
    console.log('Complete workflow successful:', questionResponse.data)
    return questionResponse.data
  } catch (error) {
    console.error('Complete workflow failed:', error)
    throw error
  }
}

// Example: Get all active questions (default)
export const getQuestionsExample = async (page = 1, limit = 10) => {
  try {
    const response = await questionApi.getQuestions({ page, limit })
    console.log('Active questions retrieved:', response.data)
    return response.data
  } catch (error) {
    console.error('Get questions failed:', error)
    throw error
  }
}

// Example: Get all questions including inactive ones
export const getAllQuestionsExample = async () => {
  try {
    const response = await questionApi.getAllQuestions(true)
    console.log('All questions (including inactive):', response.data)
    return response.data
  } catch (error) {
    console.error('Get all questions failed:', error)
    throw error
  }
}

// Example: Get question by ID
export const getQuestionByIdExample = async (questionId) => {
  try {
    const response = await questionApi.getQuestionById(questionId)
    console.log('Question details:', response.data)
    return response.data
  } catch (error) {
    console.error('Get question by ID failed:', error)
    throw error
  }
}

// Example: Delete question
export const deleteQuestionExample = async (questionId) => {
  try {
    const response = await questionApi.deleteQuestion(questionId)
    console.log('Question deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Delete question failed:', error)
    throw error
  }
}

// Example: Get random active questions
export const getRandomActiveQuestionsExample = async (count = 10) => {
  try {
    const response = await questionApi.getRandomActiveQuestions(count)
    console.log('Random active questions:', response.data)
    return response.data
  } catch (error) {
    console.error('Get random questions failed:', error)
    throw error
  }
}
