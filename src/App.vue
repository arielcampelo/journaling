<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from './store'
import DashboardView from './components/DashboardView.vue'
import HabitsView from './components/HabitsView.vue'
import JournalView from './components/JournalView.vue'
import InsightsView from './components/InsightsView.vue'
import SwipeGameView from './components/SwipeGameView.vue'
import AddHabitModal from './components/AddHabitModal.vue'
import AddEntryModal from './components/AddEntryModal.vue'
import LucideIcon from './components/LucideIcon.vue'

// Clock for simulated phone status bar
const timeString = ref('09:41')

const updateClock = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  timeString.value = `${hours}:${minutes}`
}

let timer = null
onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="phone-wrapper">
    <!-- Camera Bezel -->
    <div class="phone-notch">
      <div class="phone-camera"></div>
    </div>

    <!-- Phone Screen -->
    <div class="app-screen">
      <!-- Status Bar -->
      <div class="status-bar">
        <span class="status-time">{{ timeString }}</span>
        <div class="status-icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <path d="M2 3a7 7 0 0 1 13 0c.3.5.1 1.1-.4 1.4s-1.1.1-1.4-.4a5 5 0 0 0-9.2 0c-.3.5-.9.7-1.4.4S1.7 3.5 2 3zm2.5 3a4 4 0 0 1 8 0c.2.5 0 1.1-.5 1.3s-1.1 0-1.3-.5a2 2 0 0 0-4.4 0c-.2.5-.8.7-1.3.5s-.7-.8-.5-1.3zm2.3 2.8a1.5 1.5 0 0 1 3.4 0c.2.5-.1 1.1-.6 1.2a1 1 0 0 1-1.1-1.2h-.1c-.1.5-.7.8-1.2.6a1 1 0 0 1-.4-.6z"/>
          </svg>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="1" y="8" width="2" height="3" rx="0.5"/>
            <rect x="4" y="6" width="2" height="5" rx="0.5"/>
            <rect x="7" y="4" width="2" height="7" rx="0.5"/>
            <rect x="10" y="2" width="2" height="9" rx="0.5"/>
            <rect x="13" y="0" width="2" height="11" rx="0.5" opacity="0.3"/>
          </svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" fill="none" stroke="currentColor"/>
            <rect x="2.5" y="2.5" width="11" height="6" rx="1"/>
            <path d="M20 3.5v4c0 .8-.5 1.5-1 1.5v-7c.5 0 1 .7 1 1.5z"/>
          </svg>
        </div>
      </div>

      <!-- App Main Content Area -->
      <main class="app-content">
        <Transition name="fade" mode="out-in">
          <DashboardView v-if="store.activeTab === 'dashboard'" />
          <SwipeGameView v-else-if="store.activeTab === 'game'" />
          <HabitsView v-else-if="store.activeTab === 'habits'" />
          <JournalView v-else-if="store.activeTab === 'journal'" />
          <InsightsView v-else-if="store.activeTab === 'insights'" />
        </Transition>
      </main>

      <!-- Bottom Nav Bar -->
      <nav class="bottom-nav">
        <button :class="['nav-item', { active: store.activeTab === 'dashboard' }]" 
                @click="store.setTab('dashboard')">
          <LucideIcon name="Heart" />
          <span>Início</span>
        </button>
        
        <button :class="['nav-item', { active: store.activeTab === 'game' }]" 
                @click="store.setTab('game')">
          <LucideIcon name="Sparkles" />
          <span>Modo Jogo</span>
        </button>

        <button :class="['nav-item', { active: store.activeTab === 'habits' }]" 
                @click="store.setTab('habits')">
          <LucideIcon name="Calendar" />
          <span>Hábitos</span>
        </button>
        
        <button :class="['nav-item', { active: store.activeTab === 'journal' }]" 
                @click="store.setTab('journal')">
          <LucideIcon name="BookOpen" />
          <span>Diário</span>
        </button>
      </nav>
    </div>

    <!-- Modals -->
    <AddHabitModal />
    <AddEntryModal />
  </div>
</template>

<style>
/* Transition animation for tab views */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
