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

  function undo(current: WorkflowSnapshot) {
    if (!past.value.length) return null

    const previous = past.value.pop()!
    future.value.push(current)

    console.log('[History] Undo triggered')

    return previous
  }

  function redo(current: WorkflowSnapshot) {
    if (!future.value.length) return null

    const next = future.value.pop()!
    past.value.push(current)

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
