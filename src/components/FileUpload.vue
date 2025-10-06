<template>
  <div class="file-upload-container">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      :accept="accept"
      class="file-input"
      :id="inputId"
    />

    <div
      v-if="!modelValue"
      class="upload-area"
      @click="$refs.fileInput.click()"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleFileDrop"
      :class="{ 'drag-over': dragOver }"
    >
      <div class="upload-content">
        <div class="upload-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.2639 15.9375L12.5958 14.2834C12.2667 13.9542 11.7333 13.9542 11.4042 14.2834L9.73611 15.9375M12 14.25V19.25M20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h4>{{ title }}</h4>
        <p>Kéo thả file vào đây hoặc <span class="browse-text">duyệt file</span></p>
        <div class="supported-formats">
          <small>{{ supportedFormats }}</small>
        </div>
      </div>
    </div>

    <div v-else class="file-preview-container">
      <div v-if="isImage" class="image-preview">
        <img :src="preview" alt="Selected image" />
        <div class="image-overlay">
          <div class="image-actions">
            <button type="button" @click="$refs.fileInput.click()" class="change-file-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Thay đổi
            </button>
            <button type="button" @click="removeFile" class="remove-file-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Xóa
            </button>
          </div>
        </div>
      </div>

      <div v-else class="file-item">
        <div class="file-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="file-info">
          <span class="file-name">{{ modelValue?.name || 'file' }}</span>
          <span class="file-size">{{ formatFileSize(modelValue?.size || 0) }}</span>
        </div>
        <div class="file-actions">
          <button type="button" @click="$refs.fileInput.click()" class="change-file-btn">
            Thay đổi
          </button>
          <button type="button" @click="removeFile" class="remove-file-btn">Xóa</button>
        </div>
      </div>

      <div class="upload-status">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="#10b981"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Đã tải lên</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: File,
    default: null,
  },
  accept: {
    type: String,
    default: '*/*',
  },
  title: {
    type: String,
    default: 'Tải file lên',
  },
  supportedFormats: {
    type: String,
    default: 'Hỗ trợ tất cả file',
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024, // 5MB
  },
})

const emit = defineEmits(['update:modelValue', 'preview'])

const dragOver = ref(false)
const preview = ref('')
const inputId = ref(`file-upload-${Math.random().toString(36).substr(2, 9)}`)

const isImage = computed(() => {
  return props.modelValue && props.modelValue.type.startsWith('image/')
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event) => {
  dragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  if (file.size > props.maxSize) {
    alert(`File quá lớn! Kích thước tối đa: ${formatFileSize(props.maxSize)}`)
    return
  }

  emit('update:modelValue', file)

  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
      emit('preview', e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

const removeFile = () => {
  emit('update:modelValue', null)
  emit('preview', null)
  preview.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #e1e5e9;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #f8faff;
}

.upload-area.drag-over {
  border-color: #4f46e5;
  background: #f0f9ff;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #6b7280;
  transition: color 0.3s ease;
}

.upload-area:hover .upload-icon {
  color: #4f46e5;
}

.upload-content h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.browse-text {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: underline;
}

.supported-formats {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
}

.file-preview-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-preview {
  position: relative;
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 12px;
}

.change-file-btn,
.remove-file-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-file-btn {
  background: #4f46e5;
  color: white;
}

.change-file-btn:hover {
  background: #4338ca;
}

.remove-file-btn {
  background: #ef4444;
  color: white;
}

.remove-file-btn:hover {
  background: #dc2626;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.file-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.file-size {
  color: #6b7280;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-actions .change-file-btn,
.file-actions .remove-file-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fdf4;
  border-top: 1px solid #e5e7eb;
  color: #059669;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 32px 16px;
  }

  .upload-content h4 {
    font-size: 16px;
  }

  .upload-content p {
    font-size: 13px;
  }

  .image-actions {
    flex-direction: column;
    gap: 8px;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
