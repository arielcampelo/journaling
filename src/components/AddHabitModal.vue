<script setup>
import { ref } from 'vue'
import { store, HABIT_ICONS, HABIT_COLORS } from '../store'
import LucideIcon from './LucideIcon.vue'

const name = ref('')
const description = ref('')
const unit = ref('minutos')
const target = ref(15)
const step = ref(15)
const habitType = ref('positivo')
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
    selectedColor.value,
    unit.value.trim() || 'vezes',
    Number(target.value) || 1,
    Number(step.value) || 1,
    habitType.value
  )
  
  // Reset form
  name.value = ''
  description.value = ''
  unit.value = 'minutos'
  target.value = 15
  step.value = 15
  habitType.value = 'positivo'
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
               placeholder="Ex: Tocar Guitarra, Beber Água..." 
               class="form-input" />
      </div>

      <div class="form-group">
        <label>Tipo de Hábito</label>
        <div style="display: flex; gap: 10px; margin-top: 4px;">
          <button 
            type="button" 
            :class="['type-select-btn', { active: habitType === 'positivo' }]"
            @click="habitType = 'positivo'"
            style="flex: 1;"
          >
            🟢 Positivo (Atingir é bom)
          </button>
          <button 
            type="button" 
            :class="['type-select-btn', { active: habitType === 'negativo' }]"
            @click="habitType = 'negativo'"
            style="flex: 1;"
          >
            🔴 Negativo (Evitar ultrapassar)
          </button>
        </div>
      </div>

      <!-- Quantidade, Unidade e Porção -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        <div class="form-group">
          <label>Meta Numérica</label>
          <input type="number" v-model="target" class="form-input" placeholder="15" />
        </div>
        <div class="form-group">
          <label>Unidade Medida</label>
          <input type="text" v-model="unit" class="form-input" placeholder="minutos" />
        </div>
        <div class="form-group">
          <label>Porção (Passo)</label>
          <input type="number" v-model="step" class="form-input" placeholder="15" />
        </div>
      </div>

      <div class="form-group">
        <label>Descrição Opcional</label>
        <input type="text" 
               v-model="description" 
               placeholder="Ex: Prática diária no estúdio..." 
               class="form-input" />
      </div>

      <!-- Icon Picker -->
      <div class="form-group">
        <label>Selecione um Ícone</label>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 4px;">
          <button v-for="icon in HABIT_ICONS" :key="icon.name"
                  @click="selectedIcon = icon.name"
                  type="button"
                  :style="{ 
                    borderColor: selectedIcon === icon.name ? selectedColor : 'var(--border-glass)',
                    background: selectedIcon === icon.name ? 'rgba(255,255,255,0.03)' : 'var(--bg-card)'
                  }"
                  style="border: 2px solid; border-radius: 14px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <LucideIcon :name="icon.name" size="18" :style="{ color: selectedIcon === icon.name ? selectedColor : 'var(--text-secondary)' }" />
            <span style="font-size: 9px; color: var(--text-secondary);">{{ icon.label }}</span>
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

<style scoped>
.type-select-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  border-radius: 12px;
  padding: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-select-btn.active {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
  color: #fff;
}
</style>
