<script setup>
import { ref, computed } from 'vue'
import { store, MOODS, getTodayString } from '../store'
import LucideIcon from './LucideIcon.vue'

// Quick Journaling State
const quickContent = ref('')
const selectedCategory = ref('reflexao')
const selectedMood = ref('calm')
const showSuccessFeedback = ref(false)

const todayStr = getTodayString(0)

const categories = [
  { id: 'reflexao', label: 'Reflexão', icon: 'BookOpen', emoji: '🧘' },
  { id: 'ideia_musica', label: 'Música', icon: 'Coffee', emoji: '🎸' },
  { id: 'snippet_codigo', label: 'Código', icon: 'Brain', emoji: '💻' },
  { id: 'foco', label: 'Foco/Rotina', icon: 'Sparkles', emoji: '⚡' }
]

// Format current date
const formattedDate = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  const date = new Date()
  const rawStr = date.toLocaleDateString('pt-BR', options)
  return rawStr.charAt(0).toUpperCase() + rawStr.slice(1)
})

// Retrieve 10-day summary stats
const stats = computed(() => store.getLast10DaysStats())

// Quick Submit Journaling
const handleQuickSubmit = () => {
  if (!quickContent.value.trim()) return
  store.quickAddEntry(quickContent.value, selectedCategory.value, selectedMood.value)
  quickContent.value = ''
  showSuccessFeedback.value = true
  setTimeout(() => {
    showSuccessFeedback.value = false
  }, 2500)
}

// Download Backup JSON file
const downloadBackup = () => {
  const jsonStr = store.exportData()
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mindflow_backup_${todayStr}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Trigger File Input for Import
const fileInput = ref(null)
const triggerImport = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const success = store.importData(e.target.result)
    if (success) {
      alert('Dados do MindFlow restaurados com sucesso!')
    } else {
      alert('Erro ao importar arquivo de backup JSON.')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="dashboard-view" style="display: flex; flex-direction: column; gap: 20px; padding: 10px 0;">
    <!-- Date Header -->
    <header style="text-align: center; margin-top: 5px; position: relative;">
      <div style="position: absolute; right: 0; top: 0; display: flex; gap: 8px;">
        <button class="icon-btn" title="Baixar Backup JSON" @click="downloadBackup">
          <LucideIcon name="Droplet" size="16" />
        </button>
        <button class="icon-btn" title="Restaurar Backup JSON" @click="triggerImport">
          <LucideIcon name="Sparkles" size="16" />
        </button>
        <input type="file" ref="fileInput" accept=".json" style="display: none;" @change="handleFileImport" />
      </div>

      <span class="text-secondary" style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; opacity: 0.8;">
        Hoje é
      </span>
      <h1 class="text-gradient" style="font-size: 26px; font-weight: 700; margin-top: 4px; letter-spacing: -0.5px;">
        {{ formattedDate }}
      </h1>
      <p class="text-secondary" style="font-size: 12px; margin-top: 2px; opacity: 0.7; font-style: italic;">
        "Pouca fricção, máxima consistência."
      </p>
    </header>

    <!-- ⚡ Quick Micro-Journaling Widget (Zero Friction) -->
    <div class="glass-card quick-entry-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
          <span>⚡ Micro-Journaling Rápido</span>
        </span>
        
        <!-- Category Selector Chips -->
        <div style="display: flex; gap: 4px;">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['chip-btn', { active: selectedCategory === cat.id }]"
            @click="selectedCategory = cat.id"
            :title="cat.label"
          >
            <span>{{ cat.emoji }}</span>
          </button>
        </div>
      </div>

      <textarea
        v-model="quickContent"
        placeholder="O que passou pela sua cabeça hoje, Ariel? (Atalhos: #musica #codigo #foco)"
        rows="2"
        class="quick-textarea"
        @keydown.ctrl.enter="handleQuickSubmit"
        @keydown.meta.enter="handleQuickSubmit"
      ></textarea>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <!-- Quick Mood Picker -->
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">HUMOR:</span>
          <button 
            v-for="(info, key) in MOODS" 
            :key="key"
            :class="['mood-dot-btn', { active: selectedMood === key }]"
            @click="selectedMood = key"
            :title="info.label"
          >
            <span>{{ info.emoji }}</span>
          </button>
        </div>

        <!-- Submit Button -->
        <button class="quick-submit-btn" @click="handleQuickSubmit" :disabled="!quickContent.trim()">
          <span>Salvar</span>
          <LucideIcon name="ChevronRight" size="14" />
        </button>
      </div>

      <!-- Success Feedback Badge -->
      <Transition name="fade">
        <div v-if="showSuccessFeedback" class="success-toast">
          ✨ Nota salva com sucesso!
        </div>
      </Transition>
    </div>

    <!-- 🎯 1-Click Habit Check-in Matrix -->
    <div class="glass-card habit-matrix-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">
          🎯 Check-in de Hábitos (Hoje)
        </span>
        <button class="text-link-btn" @click="store.setTab('habits')">Ver Todos →</button>
      </div>

      <div class="habit-quick-list">
        <div 
          v-for="habit in store.habits" 
          :key="habit.id"
          :class="['habit-quick-item', { completed: habit.history.includes(todayStr) }]"
          @click="store.toggleHabit(habit.id, todayStr)"
        >
          <div class="habit-quick-left">
            <span class="habit-check-box">
              <LucideIcon v-if="habit.history.includes(todayStr)" name="Heart" size="14" />
            </span>
            <span class="habit-quick-name">{{ habit.name }}</span>
          </div>
          <span class="habit-quick-streak">🔥 {{ habit.streak }}d</span>
        </div>
      </div>
    </div>

    <!-- Navigation Menu Cards -->
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <!-- Menu Item: Diário -->
      <button class="glass-card menu-card" @click="store.setTab('journal')">
        <div class="menu-card-left">
          <div class="menu-icon-wrapper journal-theme">
            <LucideIcon name="BookOpen" size="20" />
          </div>
          <div class="menu-details">
            <h3>Diário Completo & Reflexões</h3>
            <p>{{ store.entries.length }} registros salvos</p>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size="18" class="chevron-icon" />
      </button>

      <!-- Menu Item: Insights -->
      <button class="glass-card menu-card" @click="store.setTab('insights')">
        <div class="menu-card-left">
          <div class="menu-icon-wrapper insights-theme">
            <LucideIcon name="Sparkles" size="20" />
          </div>
          <div class="menu-details">
            <h3>Métricas & Correlações</h3>
            <p>Análise comportamental dos hábitos</p>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size="18" class="chevron-icon" />
      </button>
    </div>

    <!-- Stats Summary Card (10 Days Overview) -->
    <div class="glass-card stats-summary-card">
      <h3 class="stats-summary-title">Consistência dos Últimos 10 Dias</h3>
      <div class="stats-summary-grid">
        <div class="stats-summary-item">
          <span class="stats-summary-label">Hábitos</span>
          <span class="stats-summary-val">{{ stats.habitRate }}%</span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Humor</span>
          <span class="stats-summary-val" style="font-size: 13px;">
            {{ MOODS[stats.topMood] ? MOODS[stats.topMood].emoji + ' ' + MOODS[stats.topMood].label : 'Nenhum' }}
          </span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Notas</span>
          <span class="stats-summary-val">{{ stats.entryCount }}</span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Streak</span>
          <span class="stats-summary-val">🔥 {{ stats.maxStreak }}d</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-entry-card {
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-focus);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
}

.chip-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  border-radius: 10px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn.active {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
}

.quick-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  padding: 10px;
  color: var(--text-primary);
  font-size: 13px;
  resize: none;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.quick-textarea:focus {
  border-color: var(--accent-purple);
}

.mood-dot-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-dot-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--accent-pink);
  transform: scale(1.15);
}

.quick-submit-btn {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
  border: none;
  border-radius: 12px;
  color: #fff;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.quick-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.success-toast {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Habit Matrix */
.habit-matrix-card {
  padding: 14px 16px;
  border-radius: 20px;
}

.habit-quick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.habit-quick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.habit-quick-item.completed {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
}

.habit-quick-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.habit-check-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.habit-quick-item.completed .habit-check-box {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}

.habit-quick-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.habit-quick-streak {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.text-link-btn {
  background: none;
  border: none;
  color: var(--accent-purple);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
}

.menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  color: inherit;
}

.menu-card:hover {
  transform: translateY(-2px);
  background: var(--bg-card-hover);
}

.menu-card-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.journal-theme {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
}

.insights-theme {
  background: linear-gradient(135deg, var(--mood-happy), var(--accent-pink));
}

.menu-details h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.menu-details p {
  font-size: 11px;
  color: var(--text-secondary);
}

.chevron-icon {
  color: var(--text-muted);
}

.stats-summary-card {
  padding: 14px 16px;
  background: rgba(151, 234, 210, 0.04);
  border: 1px dashed var(--border-glass);
  border-radius: 16px;
}

.stats-summary-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  text-align: center;
}

.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  text-align: center;
}

.stats-summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.stats-summary-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.stats-summary-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
