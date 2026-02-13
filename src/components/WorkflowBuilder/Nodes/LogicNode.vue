<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'  
import type { CustomNodeEvents, CustomNodeData } from '../../../types/nodes';
import { computed } from 'vue';
import Button from 'primevue/button';

const props = defineProps<NodeProps<CustomNodeData, CustomNodeEvents>>()
const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

props.data.label = props.data.label || 'Logic Node'

const borderClass = computed(() => {
  switch (props.data.status) {
    case 'running': return 'border-yellow-400'
    case 'completed': return 'border-green-500'
    default: return 'border-gray-700'
  }
})

const iconClass = computed(() => {
  switch (props.data.status) {
    case 'running': return 'pi-spin pi-spinner'
    case 'completed': return 'pi-check'
    default: return 'pi-cog'
  }
})

function handleDelete(event: MouseEvent) {
  event.stopPropagation()
  emit('delete', props.id)
}

</script>

<template>
  <div :class="['vue-flow__node-logic | flex bg-gray-900 border', borderClass, 'rounded text-main-text']">
    <div class="p-2 grid place-items-center">
      <i :class="['pi', iconClass, ' | text-accent']"></i>
    </div>
    <div class="p-2 pl-0">{{ data.label }}</div>
   
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" id="True" :position="Position.Left" label="True" />
    <Handle type="source" id="False" :position="Position.Right" label="False" />
    <Button
      icon="pi pi-trash"
      severity="danger"
      text
      size="small"
      class=""
      @click="handleDelete"
    />
  </div>
</template>