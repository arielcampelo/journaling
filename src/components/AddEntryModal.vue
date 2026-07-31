<script setup>
import { ref, watch, nextTick } from 'vue'
import { store, MOODS } from '../store'
import LucideIcon from './LucideIcon.vue'

const content = ref('')
const tagsString = ref('')
const textareaRef = ref(null)

// Initialize all 6 moods to default values
const moodRatings = ref({
  happy: 5,
  calm: 5,
  productive: 5,
  anxious: 0,
  tired: 0,
  sad: 0
})

// Focus textarea on open and set preselected mood if any
watch(() => store.showAddEntryModal, (isOpen) => {
  if (isOpen) {
    // Reset to defaults
    moodRatings.value = {
      happy: 5,
      calm: 5,
      productive: 5,
      anxious: 0,
      tired: 0,
      sad: 0
    }
    
    if (store.preselectedMood) {
      // Set preselected mood to high intensity (9/10), others stay default
      moodRatings.value[store.preselectedMood] = 9
      store.preselectedMood = null
    }
    
    // Auto focus textarea
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus()
      }
    })
  }
})

const handleClose = () => {
  store.showAddEntryModal = false
}

const handleSubmit = () => {
  if (!content.value.trim()) return
  
  store.addEntry(content.value.trim(), moodRatings.value, tagsString.value)
  
  // Reset form
  content.value = ''
  tagsString.value = ''
  
  store.showAddEntryModal = false
}
</script>

<template>
  <div v-if="store.showAddEntryModal" class="bottom-sheet-backdrop" @click.self="handleClose">
    <div class="bottom-sheet" style="max-height: 90%;">
      <!-- Header -->
      <div class="bottom-sheet-header">
        <h2>Como está sua mente?</h2>
        <button class="close-btn" @click="handleClose">
          <LucideIcon name="X" size="18" />
        </button>
      </div>

      <!-- Multi-Mood Sliders Grid -->
      <div class="form-group">
        <label>Intensidade das Emoções (0 a 10)</label>
        <div class="mood-sliders-grid">
          <div v-for="(value, key) in MOODS" :key="key" class="mood-slider-card">
            <div class="mood-slider-header">
              <span class="mood-slider-title">
                <span class="mood-slider-emoji">{{ value.emoji }}</span>
                {{ value.label }}
              </span>
              <span class="mood-slider-value" :style="{ background: value.color }">
                {{ moodRatings[key] }}
              </span>
            </div>
            <input type="range" 
                   min="0" 
                   max="10" 
                   v-model.number="moodRatings[key]"
                   class="mood-slider"
                   :style="{ 
                     '--mood-color': value.color, 
                     background: `linear-gradient(to right, ${value.color} 0%, ${value.color} ${moodRatings[key] * 10}%, rgba(0,0,0,0.08) ${moodRatings[key] * 10}%, rgba(0,0,0,0.08) 100%)`
                   }" />
          </div>
        </div>
      </div>

      <!-- Text Entry -->
      <div class="form-group">
        <label>Registre seus Pensamentos</label>
        <textarea ref="textareaRef"
                  v-model="content"
                  placeholder="Escreva sobre o seu dia, sentimentos, reflexões ou aprendizados..."
                  class="form-textarea"></textarea>
      </div>

      <!-- Tags Input -->
      <div class="form-group">
        <label>Tags / Marcadores</label>
        <input type="text"
               v-model="tagsString"
               placeholder="Ex: reflexao, trabalho, calistenia (separe por espaços)"
               class="form-input" />
      </div>

      <!-- Submit Button -->
      <button class="btn-primary"
              :disabled="!content.trim()"
              :style="{ 
                opacity: content.trim() ? 1 : 0.5, 
                cursor: content.trim() ? 'pointer' : 'not-allowed',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))'
              }"
              @click="handleSubmit"
              style="margin-top: 10px;">
        Salvar no Diário
      </button>
    </div>
  </div>
</template>

<style scoped>
.mood-sliders-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 6px;
}

.mood-slider-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mood-slider-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
}

.mood-slider-emoji {
  font-size: 16px;
}

.mood-slider-value {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Custom Range Slider styling */
.mood-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mood-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--mood-color);
  border: 2px solid #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  transition: transform 0.1s ease;
}

.mood-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.mood-slider::-webkit-slider-thumb:active {
  transform: scale(1.2);
}
</style>
