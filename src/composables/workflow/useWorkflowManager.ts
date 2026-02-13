import { useVueFlow } from '@vue-flow/core'
import cloneDeep from 'lodash.clonedeep'
import { useWorkflowHistory, type WorkflowSnapshot } from './useWorkflowHistory'
import { useWorkflowPersistence } from './useWorkflowPersistence'

export function useWorkflowManager() {
  const {
    getNodes,
    getEdges,
    setNodes,
    setEdges,
  } = useVueFlow()

  const history = useWorkflowHistory()
  const persistence = useWorkflowPersistence()

  function snapshot() {
    const snap = {
      nodes: cloneDeep(getNodes.value),
      edges: cloneDeep(getEdges.value),
    } as WorkflowSnapshot;

    history.pushDebounced(snap)
    persistence.saveDebounced(snap)
  }

  function undo() {
    const previous = history.undo()
    if (!previous) return

    setNodes(previous.nodes)
    setEdges(previous.edges)
  }

  function redo() {
    const next = history.redo()
    if (!next) return

    setNodes(next.nodes)
    setEdges(next.edges)
  }

  function loadFromStorage() {
    const saved = persistence.load()
    if (!saved) return

    setNodes(saved.nodes)
    setEdges(saved.edges)
  }

  function exportWorkflow() {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        nodes: getNodes.value,
        edges: getEdges.value,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `workflow-${Date.now()}.json`
      a.click()

      URL.revokeObjectURL(url)

      console.log('[Export] Workflow exported successfully')
    } catch (error) {
      console.error('[Export] Failed:', error)
    }
  }

  function importWorkflow(file: File) {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string
        const parsed = JSON.parse(raw)

        if (!parsed.nodes || !parsed.edges) {
          throw new Error('Invalid workflow structure')
        }

        setNodes(parsed.nodes)
        setEdges(parsed.edges)

        persistence.save(parsed)

        console.log('[Import] Workflow imported successfully')
      } catch (error) {
        console.error('[Import] Failed:', error)
      }
    }

    reader.readAsText(file)
  }

  return {
    snapshot,
    undo,
    redo,
    loadFromStorage,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clear: persistence.clear,
    exportWorkflow,
    importWorkflow,
  }
}
