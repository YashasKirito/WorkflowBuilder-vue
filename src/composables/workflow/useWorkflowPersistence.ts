import { useVueFlow } from '@vue-flow/core'
import debounce from 'lodash.debounce'

const STORAGE_KEY = 'workflow_v1'

export function useWorkflowPersistence() {
  const {
    $reset
  } = useVueFlow()

  function save(data: any) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('[Persistence] Workflow saved')
  }

  const saveDebounced = debounce(save, 1000)

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    console.log('[Persistence] Workflow loaded')
    return JSON.parse(raw)
  }

  function clear() {
    $reset()
    localStorage.removeItem(STORAGE_KEY)
    console.log('[Persistence] Workflow cleared')

  }

  return {
    save,
    saveDebounced,
    load,
    clear,
  }
}
