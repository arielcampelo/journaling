<script setup>
import { ref, computed } from 'vue'
import { store, MOODS } from '../store'
import LucideIcon from './LucideIcon.vue'

const searchQuery = ref('')

const filteredEntries = computed(() => {
  if (!searchQuery.value.trim()) return store.entries
  
  const query = searchQuery.value.toLowerCase().trim()
  // Check if it's a tag search (e.g. starting with #)
  const isTagSearch = query.startsWith('#')
  const cleanQuery = isTagSearch ? query.slice(1) : query
  
  return store.entries.filter(entry => {
    if (isTagSearch) {
      return entry.tags.some(tag => tag.toLowerCase().includes(cleanQuery))
    }
    
    // Default search content, tags, or mood label
    const contentMatch = entry.content.toLowerCase().includes(query)
    const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(query))
    const moodMatch = MOODS[entry.mood]?.label.toLowerCase().includes(query)
    
    return contentMatch || tagMatch || moodMatch
  })
})

const formatDate = (isoStr) => {
  const d = new Date(isoStr)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (isoStr) => {
  const d = new Date(isoStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const filterByTag = (tag) => {
  searchQuery.value = '#' + tag
}

const clearFilter = () => {
  searchQuery.value = ''
}

const handleDelete = (id) => {
  if (confirm('Tem certeza que deseja excluir esta nota de diário?')) {
    store.deleteEntry(id)
  }
}
</script>

<template>
  <div class="journal-view">
    <!-- Header -->
    <header class="journal-header" style="display: flex; justify-content: space-between; align-items: center;">
      <h1 class="text-gradient">Seu Diário</h1>
      <button class="fab" style="position: static; width: 40px; height: 40px; border-radius: 12px; box-shadow: none;" @click="store.showAddEntryModal = true">
        <LucideIcon name="PenTool" size="18" />
      </button>
    </header>

    <!-- Search/Filter Bar -->
    <div style="margin-top: 16px; position: relative;">
      <input type="text" 
             v-model="searchQuery" 
             placeholder="Buscar por palavras ou #tags..." 
             class="form-input" 
             style="padding-left: 40px; padding-right: 40px;" />
      <LucideIcon name="Smile" size="18" class="text-secondary" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.5;" />
      
      <button v-if="searchQuery" 
              @click="clearFilter" 
              style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer;">
        <LucideIcon name="X" size="16" />
      </button>
    </div>
    
    <!-- Active Tag Filter Badge -->
    <div v-if="searchQuery" style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
      <span class="text-secondary" style="font-size: 12px;">Filtrando por: </span>
      <span class="tag" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px;">
        {{ searchQuery }}
        <LucideIcon name="X" size="10" @click="clearFilter" style="cursor: pointer;" />
      </span>
    </div>

    <!-- Timeline of Entries -->
    <div class="timeline" style="margin-top: 16px;">
      <div v-if="filteredEntries.length > 0" v-for="entry in filteredEntries" :key="entry.id" 
           :class="['timeline-card', entry.mood]">
        
        <div class="timeline-header">
          <div>
            <span class="timeline-date" style="font-weight: 600; color: var(--text-primary);">{{ formatDate(entry.date) }}</span>
            <span class="text-secondary" style="font-size: 11px; margin-left: 6px;">{{ formatTime(entry.date) }}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span :class="['timeline-mood-tag', entry.mood]">
              {{ MOODS[entry.mood]?.emoji }} {{ MOODS[entry.mood]?.label }}
            </span>
            
            <button @click="handleDelete(entry.id)" 
                    style="background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;"
                    title="Excluir pensamento">
              <LucideIcon name="Trash2" size="14" />
            </button>
          </div>
        </div>

        <!-- Mood Ratings Row -->
        <div v-if="entry.moods" class="timeline-mood-ratings" style="display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 6px 0;">
          <div v-for="(val, key) in entry.moods" :key="key" 
               v-show="val > 0"
               class="mini-mood-badge"
               :style="{ 
                 background: key === entry.mood ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)',
                 border: `1px solid ${MOODS[key]?.color}40`
               }"
               style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">
            <span>{{ MOODS[key]?.emoji }}</span>
            <span style="color: var(--text-secondary); font-size: 10px;">{{ MOODS[key]?.label }}</span>
            <span :style="{ color: MOODS[key]?.color }" style="font-weight: 800; font-size: 11px;">{{ val }}</span>
          </div>
        </div>
        
        <p class="timeline-content">{{ entry.content }}</p>
        
        <div class="timeline-tags" v-if="entry.tags && entry.tags.length > 0">
          <span v-for="tag in entry.tags" :key="tag" 
                class="tag" 
                style="cursor: pointer;"
                @click="filterByTag(tag)">
            #{{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="glass-card" style="text-align: center; padding: 48px 24px; color: var(--text-secondary);">
        <LucideIcon name="PenTool" size="48" style="margin: 0 auto 16px auto; color: var(--text-muted); opacity: 0.6;" />
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Nenhum pensamento</h3>
        <p style="font-size: 13px; line-height: 1.4; margin-bottom: 20px;">
          {{ searchQuery ? 'Nenhum diário corresponde aos critérios da busca.' : 'Seu diário está em branco. Registre suas emoções e pensamentos do dia!' }}
        </p>
        <button v-if="!searchQuery" class="btn-primary" style="padding: 10px 24px;" @click="store.showAddEntryModal = true">
          Escrever Diário
        </button>
        <button v-else class="btn-primary" style="padding: 10px 24px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass);" @click="clearFilter">
          Limpar Filtro
        </button>
      </div>
    </div>
  </div>
</template>
