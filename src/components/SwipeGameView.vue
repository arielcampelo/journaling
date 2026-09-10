<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store, getTodayString } from '../store'
import LucideIcon from './LucideIcon.vue'

const todayStr = getTodayString(0)

// Random deck state
const deck = ref([])
const currentIndex = ref(0)

// Dragging gesture state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const actionFeedback = ref('') // 'left' | 'right' | 'up' | ''

// Timer state
const showTimerModal = ref(false)
const timerSeconds = ref(60)
let timerInterval = null
const isTimerRunning = ref(false)
const timerCompleted = ref(false)

// Active habit
const currentHabit = computed(() => {
  if (deck.value.length === 0) return null
  return deck.value[currentIndex.value % deck.value.length]
})

// Current progress
const currentProgress = computed(() => {
  if (!currentHabit.value) return 0
  return store.getHabitProgress(currentHabit.value, todayStr)
})

// Progress percentage
const progressPercent = computed(() => {
  if (!currentHabit.value || !currentHabit.value.target) return 0
  const pct = Math.round((currentProgress.value / currentHabit.value.target) * 100)
  return Math.min(pct, 100)
})

// Check if negative habit target exceeded
const isLimitExceeded = computed(() => {
  if (!currentHabit.value || currentHabit.value.type !== 'negativo') return false
  return currentProgress.value > currentHabit.value.target
})

// Load and shuffle deck
const initializeDeck = () => {
  deck.value = store.getRandomizedHabitDeck()
  currentIndex.value = 0
}

onMounted(() => {
  initializeDeck()
})

// Drag Handlers
const handlePointerDown = (e) => {
  isDragging.value = true
  dragStartX.value = e.clientX || (e.touches && e.touches[0].clientX) || 0
  dragStartY.value = e.clientY || (e.touches && e.touches[0].clientY) || 0
  dragOffsetX.value = 0
  dragOffsetY.value = 0
  actionFeedback.value = ''
}

const handlePointerMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0
  dragOffsetX.value = currentX - dragStartX.value
  dragOffsetY.value = currentY - dragStartY.value

  if (dragOffsetY.value < -80 && Math.abs(dragOffsetX.value) < 80) {
    actionFeedback.value = 'up'
  } else if (dragOffsetX.value > 80) {
    actionFeedback.value = 'right'
  } else if (dragOffsetX.value < -80) {
    actionFeedback.value = 'left'
  } else {
    actionFeedback.value = ''
  }
}

const handlePointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (actionFeedback.value === 'left') {
    handleSkip()
  } else if (actionFeedback.value === 'right') {
    handleComplete()
  } else if (actionFeedback.value === 'up') {
    startTimerModal()
  }

  dragOffsetX.value = 0
  dragOffsetY.value = 0
  actionFeedback.value = ''
}

// Action: Skip (Left)
const handleSkip = () => {
  if (deck.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % deck.value.length
}

// Action: Complete / Add Step (Right)
const handleComplete = () => {
  if (!currentHabit.value) return
  store.incrementHabitProgress(currentHabit.value.id, currentHabit.value.step || 1, todayStr)
  
  // Special timestamp tracking for plant care
  if (currentHabit.value.id === 'h_plantas') {
    currentHabit.value.lastCheckTimestamp = Date.now()
    currentHabit.value.lastWateredDate = todayStr
  }

  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % deck.value.length
  }, 250)
}

// Action: Start 1-Minute Timer (Up)
const startTimerModal = () => {
  showTimerModal.value = true
  timerSeconds.value = 60
  isTimerRunning.value = true
  timerCompleted.value = false

  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      clearInterval(timerInterval)
      isTimerRunning.value = false
      timerCompleted.value = true
    }
  }, 1000)
}

const cancelTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  isTimerRunning.value = false
  showTimerModal.value = false
}

const confirmTimerCompletion = () => {
  cancelTimer()
  handleComplete()
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// Card transform style during drag
const cardStyle = computed(() => {
  if (!isDragging.value && dragOffsetX.value === 0 && dragOffsetY.value === 0) {
    return { transform: 'none', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
  }
  const rotateDeg = dragOffsetX.value * 0.08
  return {
    transform: `translate3d(${dragOffsetX.value}px, ${dragOffsetY.value}px, 0) rotate(${rotateDeg}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease'
  }
})
</script>

<template>
  <div class="swipe-game-view" style="display: flex; flex-direction: column; gap: 16px; padding: 10px 0; align-items: center;">
    <!-- Top Header -->
    <header style="text-align: center; margin-top: 5px;">
      <span class="badge-pill">
        🎮 Modo Tinder de Hábitos
      </span>
      <h1 class="text-gradient" style="font-size: 24px; font-weight: 700; margin-top: 6px;">
        Desafios de Hoje
      </h1>
      <p class="text-secondary" style="font-size: 11px; opacity: 0.7;">
        👈 Pular (Esquerda) | ⬆️ 1 min Agora (Cima) | 👉 Sim, Fiz! (Direita)
      </p>
    </header>

    <!-- Card Stack Container -->
    <div v-if="currentHabit" class="card-stack-wrapper">
      <div 
        class="swipe-card glass-card"
        :style="[cardStyle, { borderColor: isLimitExceeded ? '#ef4444' : (currentHabit.color || 'var(--border-focus)') }]"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @touchstart="handlePointerDown"
        @touchmove="handlePointerMove"
        @touchend="handlePointerUp"
      >
        <!-- Overlay Feedback Labels -->
        <div v-if="actionFeedback === 'right'" class="action-overlay overlay-right">
          <span>SIM, FIZ! 🔥</span>
        </div>
        <div v-if="actionFeedback === 'left'" class="action-overlay overlay-left">
          <span>DEPOIS ⏩</span>
        </div>
        <div v-if="actionFeedback === 'up'" class="action-overlay overlay-up">
          <span>FAZER AGORA ⏱️</span>
        </div>

        <!-- Habit Type Tag -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span :class="['habit-type-badge', currentHabit.type === 'negativo' ? 'type-negative' : 'type-positive']">
            {{ currentHabit.type === 'negativo' ? '🔴 Hábito Negativo (Limite Máx)' : '🟢 Hábito Positivo' }}
          </span>
          <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
            🔥 {{ currentHabit.streak || 0 }}d streak
          </span>
        </div>

        <!-- Habit Icon & Title -->
        <div class="habit-card-body">
          <div class="habit-big-icon" :style="{ background: currentHabit.color || 'var(--accent-purple)' }">
            <LucideIcon :name="currentHabit.icon || 'Sparkles'" size="32" />
          </div>

          <h2 class="habit-title">{{ currentHabit.name }}</h2>

          <!-- Interactive Prompt Question -->
          <div class="habit-prompt-box">
            <span class="habit-prompt-text">
              "{{ currentHabit.prompt || currentHabit.description || 'Confirmar realização?' }}"
            </span>
          </div>

          <!-- Special Warning for Plant Care -->
          <div v-if="currentHabit.id === 'h_plantas'" class="special-plant-warning">
            <span>🌿 Dica: Avalie a umidade do solo antes de regar (ideal 2x/dia com intervalo de 4h).</span>
          </div>

          <!-- Goal & Progress Bar -->
          <div class="progress-box">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="font-weight: 600; color: var(--text-secondary);">Realizado Hoje:</span>
              <span :style="{ color: isLimitExceeded ? '#ef4444' : 'var(--text-primary)', fontWeight: '700' }">
                {{ currentProgress }} / {{ currentHabit.target }} {{ currentHabit.unit || 'vezes' }}
              </span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-bar-fill" 
                :style="{ width: progressPercent + '%', background: isLimitExceeded ? '#ef4444' : (currentHabit.color || 'var(--accent-purple)') }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Tip -->
        <div class="card-footer-tip">
          <span v-if="isLimitExceeded" style="color: #ef4444; font-weight: 700;">
            ⚠️ Atenção: Você ultrapassou o limite diário de {{ currentHabit.target }} {{ currentHabit.unit }}!
          </span>
          <span v-else>
            Porção: +{{ currentHabit.step || 1 }} {{ currentHabit.unit || 'vezes' }} ao mover para a direita
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="glass-card empty-card" style="padding: 30px; text-align: center;">
      <h3>Nenhum hábito cadastrado!</h3>
      <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
        Cadastre novos hábitos para jogar o Tinder de Metas.
      </p>
    </div>

    <!-- Action Buttons Bar -->
    <div class="action-buttons-bar" v-if="currentHabit">
      <button class="game-btn btn-skip" @click="handleSkip" title="Pular / Não Fiz">
        <LucideIcon name="ChevronRight" size="22" style="transform: rotate(180deg);" />
        <span>Pular</span>
      </button>

      <button class="game-btn btn-timer" @click="startTimerModal" title="Fazer AGORA em 1 min">
        <LucideIcon name="Sparkles" size="22" />
        <span>1 min AGORA</span>
      </button>

      <button class="game-btn btn-complete" @click="handleComplete" title="Sim, Fiz!">
        <LucideIcon name="Heart" size="22" />
        <span>Sim (+{{ currentHabit.step || 1 }})</span>
      </button>
    </div>

    <!-- Shuffle Button -->
    <button class="text-link-btn" @click="initializeDeck" style="margin-top: 5px;">
      🔀 Embaralhar Cards Novamente
    </button>

    <!-- ⏱️ 1-Minute Timer Modal Overlay -->
    <Transition name="fade">
      <div v-if="showTimerModal" class="timer-overlay-modal">
        <div class="timer-modal-content glass-card">
          <button class="close-timer-btn" @click="cancelTimer">✕</button>

          <span class="badge-pill" style="margin-bottom: 12px;">⏱️ Foco Máximo (1 Minuto)</span>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">{{ currentHabit?.name }}</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 20px;">
            Execute a sua meta sem distrações pelos próximos 60 segundos!
          </p>

          <!-- Circular Clock Display -->
          <div class="timer-circle-display">
            <span class="timer-big-text">{{ timerSeconds }}s</span>
            <span class="timer-subtext" v-if="isTimerRunning">EM ANDAMENTO...</span>
            <span class="timer-subtext" v-else>CONCLUÍDO!</span>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 24px; width: 100%;">
            <button class="secondary-btn" style="flex: 1;" @click="cancelTimer">Cancelar</button>
            <button class="primary-btn" style="flex: 1;" @click="confirmTimerCompletion">
              {{ timerCompleted ? '✨ Confirmar Conclusão!' : 'Pronto Antes' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.badge-pill {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid var(--accent-purple);
  color: var(--accent-purple);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.card-stack-wrapper {
  width: 100%;
  max-width: 340px;
  height: 400px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swipe-card {
  width: 100%;
  height: 100%;
  border-radius: 28px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  position: relative;
  user-select: none;
  touch-action: none;
  cursor: grab;
  background: var(--bg-card);
  border-width: 2px;
}

.swipe-card:active {
  cursor: grabbing;
}

.action-overlay {
  position: absolute;
  top: 20px;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 1px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.overlay-right {
  right: 20px;
  background: #10b981;
  color: #fff;
}

.overlay-left {
  left: 20px;
  background: #f59e0b;
  color: #fff;
}

.overlay-up {
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--accent-purple);
  color: #fff;
}

.habit-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

.type-positive {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.type-negative {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.habit-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin: auto 0;
}

.habit-big-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.habit-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
}

.habit-prompt-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed var(--border-glass);
  border-radius: 12px;
  padding: 8px 12px;
  width: 100%;
}

.habit-prompt-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-pink);
  font-style: italic;
}

.special-plant-warning {
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 10px;
  color: #10b981;
  font-weight: 600;
}

.progress-box {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 10px 12px;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.card-footer-tip {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  font-weight: 600;
}

.action-buttons-bar {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 340px;
}

.game-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 18px;
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-skip:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
}

.btn-timer:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: var(--accent-purple);
}

.btn-complete:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

.text-link-btn {
  background: none;
  border: none;
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Timer Overlay */
.timer-overlay-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.timer-modal-content {
  width: 100%;
  max-width: 320px;
  padding: 24px;
  border-radius: 28px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-focus);
}

.close-timer-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
}

.timer-circle-display {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid var(--accent-purple);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  background: rgba(139, 92, 246, 0.05);
}

.timer-big-text {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
}

.timer-subtext {
  font-size: 9px;
  font-weight: 700;
  color: var(--accent-purple);
  letter-spacing: 1px;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
  border: none;
  color: #fff;
  border-radius: 12px;
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
}
</style>
