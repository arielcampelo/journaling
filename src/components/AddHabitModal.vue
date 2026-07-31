<script setup>
import { ref } from 'vue'
import { store, HABIT_ICONS, HABIT_COLORS } from '../store'
import LucideIcon from './LucideIcon.vue'

const name = ref('')
const description = ref('')
const selectedIcon = ref(HABIT_ICONS[0].name)
const selectedColor = ref(HABIT_COLORS[0].hex)

const handleClose = () => {
  store.showAddHabitModal = false
}

const handleSubmit = () => {
  if (!name.value.trim()) return
  
  store.addHabit(
    name.value.trim(),
    description.value.trim(),
    selectedIcon.value,
    selectedColor.value
  )
  
  // Reset form
  name.value = ''
  description.value = ''
  selectedIcon.value = HABIT_ICONS[0].name
  selectedColor.value = HABIT_COLORS[0].hex
  
  store.showAddHabitModal = false
}
</script>

<template>
  <div v-if="store.showAddHabitModal" class="bottom-sheet-backdrop" @click.self="handleClose">
    <div class="bottom-sheet">
      <!-- Header -->
      <div class="bottom-sheet-header">
        <h2>Criar Novo Hábito</h2>
        <button class="close-btn" @click="handleClose">
          <LucideIcon name="X" size="18" />
        </button>
      </div>

      <!-- Form -->
      <div class="form-group">
        <label>Nome do Hábito</label>
        <input type="text" 
               v-model="name" 
               placeholder="Ex: Meditação, Exercício..." 
               class="form-input" />
      </div>

      <div class="form-group">
        <label>Descrição / Meta</label>
        <input type="text" 
               v-model="description" 
               placeholder="Ex: 10 min por dia, bater 3L..." 
               class="form-input" />
      </div>

      <!-- Icon Picker -->
      <div class="form-group">
        <label>Selecione um Ícone</label>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 4px;">
          <button v-for="icon in HABIT_ICONS" :key="icon.name"
                  @click="selectedIcon = icon.name"
                  type="button"
                  :style="{ 
                    borderColor: selectedIcon === icon.name ? selectedColor : 'var(--border-glass)',
                    background: selectedIcon === icon.name ? 'rgba(255,255,255,0.03)' : 'var(--bg-card)'
                  }"
                  style="border: 2px solid; border-radius: 16px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <LucideIcon :name="icon.name" size="20" :style="{ color: selectedIcon === icon.name ? selectedColor : 'var(--text-secondary)' }" />
            <span style="font-size: 10px; color: var(--text-secondary);">{{ icon.label }}</span>
          </button>
        </div>
      </div>

      <!-- Color Picker -->
      <div class="form-group">
        <label>Cor do Tema</label>
        <div class="color-picker" style="margin-top: 4px;">
          <button v-for="color in HABIT_COLORS" :key="color.hex"
                  @click="selectedColor = color.hex"
                  type="button"
                  :class="['color-option', { selected: selectedColor === color.hex }]"
                  :style="{ backgroundColor: color.hex }">
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button class="btn-primary" 
              :disabled="!name.trim()"
              :style="{ opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed' }"
              @click="handleSubmit"
              style="margin-top: 10px;">
        Adicionar Hábito
      </button>
    </div>
  </div>
</template>
