<template>
  <div v-if="showTokenStatus" class="token-status">
    <div class="token-info">
      <strong>Token Status:</strong>
      <span :class="statusClass">{{ tokenStatus }}</span>
      <span v-if="timeUntilExpiry" class="expiry-time"> (Expires in: {{ timeUntilExpiry }}) </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import tokenManager from '@/utils/tokenManager.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const accessToken = ref('')
const refreshToken = ref('')
const updateTimer = ref(null)

const showTokenStatus = computed(() => props.show && accessToken.value)

const tokenStatus = computed(() => {
  if (!accessToken.value) return 'No Token'
  if (tokenManager.isTokenExpired(accessToken.value)) return 'Expired'
  if (tokenManager.shouldRefreshToken(accessToken.value)) return 'Needs Refresh'
  return 'Valid'
})

const statusClass = computed(() => {
  switch (tokenStatus.value) {
    case 'Valid':
      return 'status-valid'
    case 'Needs Refresh':
      return 'status-warning'
    case 'Expired':
      return 'status-expired'
    default:
      return 'status-none'
  }
})

const timeUntilExpiry = computed(() => {
  if (!accessToken.value) return ''
  return tokenManager.getFormattedTimeUntilExpiry(accessToken.value)
})

const updateTokenInfo = () => {
  accessToken.value = localStorage.getItem('accessToken') || ''
  refreshToken.value = localStorage.getItem('refreshToken') || ''
}

onMounted(() => {
  updateTokenInfo()

  // Update every 5 seconds
  updateTimer.value = setInterval(() => {
    updateTokenInfo()
  }, 5000)
})

onUnmounted(() => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
  }
})
</script>

<style scoped>
.token-status {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  font-family: monospace;
}

.token-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-valid {
  color: #4ade80;
}

.status-warning {
  color: #fbbf24;
}

.status-expired {
  color: #f87171;
}

.status-none {
  color: #9ca3af;
}

.expiry-time {
  color: #d1d5db;
  font-size: 11px;
}
</style>
