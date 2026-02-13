import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useToast } from "primevue/usetoast";

export function useWorkflowRunner() {
  const { getNodes, getEdges, updateNode } = useVueFlow()
  const toast = useToast();

  const isRunning = ref(false)

  function getNodeById(id: string) {
    return getNodes.value.find(n => n.id === id)
  }

  function getOutgoing(nodeId: string) {
    return getEdges.value.filter(e => e.source === nodeId)
  }

  function findTrigger() {
    return getNodes.value.find(n => n.type === 'trigger')
  }

  async function executeNode(node: any) {
    console.log(`[Runner] Executing ${node.id}`)

    updateNode(node.id, {
      data: {
        ...node.data,
        status: 'running',
      },
    })

    await new Promise(res => setTimeout(res, 600))

    updateNode(node.id, {
      data: {
        ...node.data,
        status: 'completed',
      },
    })
  }

  function pickNextEdge(node: any) {
    const outgoing = getOutgoing(node.id)

    if (!outgoing.length) return null

    // If logic node → random pick
    if (node.type === 'logic' && outgoing.length === 2) {
      const randomIndex = Math.floor(Math.random() * 2)
      return outgoing[randomIndex]
    }

    // Normal node → first outgoing
    return outgoing[0]
  }

  async function run() {
    if (isRunning.value) return

    const trigger = findTrigger()
    if (!trigger) {
      console.warn('[Runner] No trigger node found')
      toast.add({ severity: 'error', summary: 'Error', detail: 'No trigger node found', life: 2000, group: 'br' });
      return
    }

    isRunning.value = true
    console.log('[Runner] Started')
    toast.add({ severity: 'success', summary: 'Success', detail: 'Workflow started', life: 2000, group: 'br' });

    try {
      let currentNode: any = trigger

      while (currentNode) {
        await executeNode(currentNode)

        const nextEdge = pickNextEdge(currentNode)
        if (!nextEdge) break

        currentNode = getNodeById(nextEdge.target)
      }

      console.log('[Runner] Finished')
      // Reset when finished
      toast.add({ severity: 'success', summary: 'Success', detail: 'Workflow executed successfully', life: 2000, group: 'br' });

      setTimeout(() => {
        reset()
      }, 2000)
    } finally {
      isRunning.value = false
    }
  }

  function reset() {
    getNodes.value.forEach(node => {
      updateNode(node.id, {
        data: {
          ...node.data,
          status: 'idle',
        },
      })
    })
  }

  return {
    run,
    reset,
    isRunning,
  }
}
