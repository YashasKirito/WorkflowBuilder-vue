import { ref } from 'vue'
import type { CustomNode } from '../../types/nodes';
import type { Edge } from '@vue-flow/core';
import debounce from 'lodash.debounce';

export interface WorkflowSnapshot {
  nodes: CustomNode[]
  edges: Edge[]
}

export function useWorkflowHistory(limit = 50) {
  const past = ref<WorkflowSnapshot[]>([])
  const future = ref<WorkflowSnapshot[]>([])

  function push(snapshot: WorkflowSnapshot) {
    past.value.push(snapshot)

    if (past.value.length > limit) {
      past.value.shift()
    }

    future.value = []

    console.log('[History] Snapshot added.', past.value)
  }

  const pushDebounced = debounce(push, 1000)

  function undo() {
    if (past.value.length < 2) return null

    const present = past.value.pop()!
    future.value.push(present)

    console.log('[History] Undo triggered')

    return past.value[past.value.length - 1]
  }

  function redo() {
    if (!future.value.length) return null

    const next = future.value.pop()!
    past.value.push(next)

    console.log('[History] Redo triggered')

    return next
  }

  return {
    push,
    pushDebounced,
    undo,
    redo,
    canUndo: () => past.value.length > 0,
    canRedo: () => future.value.length > 0,
  }
}
