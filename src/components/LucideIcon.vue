<script setup>
import { computed } from 'vue'
import * as icons from '@lucide/vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  strokeWidth: {
    type: Number,
    default: 2
  }
})

const iconComponent = computed(() => {
  const resolved = icons[props.name]
  if (!resolved) {
    return icons.Smile // Fallback icon
  }
  return resolved
})
</script>

<template>
  <component 
    :is="iconComponent" 
    :size="props.size" 
    :stroke-width="props.strokeWidth"
  />
</template>
