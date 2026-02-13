<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload'
import { Background } from '@vue-flow/background'
import { MarkerType, useVueFlow, VueFlow, type Connection, type NodeMouseEvent } from '@vue-flow/core'
import TriggerNode from './Nodes/TriggerNode.vue'
import ActionNode from './Nodes/ActionNode.vue'
import LogicNode from './Nodes/LogicNode.vue'
import UtilityNode from './Nodes/UtilityNode.vue'
import NodePalette from './Palette/NodePalette.vue'
import NodeConfigForm from './NodeConfigForm/NodeConfigForm.vue'
import { createsCycle } from './helpers'
import type { CustomNode } from '../../types/nodes'
import { useWorkflowManager } from '../../composables/workflow/useWorkflowManager'
import { useWorkflowRunner } from '../../composables/workflow/useWorkflowRunner';
import SplitButton from 'primevue/splitbutton'

const { onConnect, addEdges, getEdges, project, addNodes, onNodeClick, updateNode, removeNodes } = useVueFlow();

const selectedNode = ref<CustomNode | null>(null);
const isConfigOpen = ref(false);

onConnect((params) => addEdges([{ ...params, markerEnd: MarkerType.Arrow, label: params.sourceHandle ? params.sourceHandle : "" }]));

onNodeClick((event: NodeMouseEvent) => {
  selectedNode.value = event.node as CustomNode;
  isConfigOpen.value = true;
});

function handleNodeUpdate(nodeId: string, data: CustomNode["data"]) {
  updateNode(nodeId, {
    data
  });
}

function isValidConnection(connection: Connection) {
  const edges = getEdges.value

  const { source, target, sourceHandle, targetHandle } = connection

  // Block self-loop
  if (source === target) return false

  // Only 1 outgoing per source handle
  const sourceUsed = edges.some(
    (e) =>
      e.source === source &&
      e.sourceHandle === sourceHandle
  )

  if (sourceUsed) return false

  // Only 1 incoming per target handle
  const targetUsed = edges.some(
    (e) =>
      e.target === target &&
      e.targetHandle === targetHandle
  )

  if (targetUsed) return false

  // Prevent cycles
  if (createsCycle(source, target, edges)) {
    return false
  }

  return true
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  const nodeData = event.dataTransfer?.getData('application/vueflow')

  if (nodeData) {
    const node = JSON.parse(nodeData)
    const position = project({ x: event.clientX - 280, y: event.clientY - 40 })

    const newNode = {
      id: Math.random().toString(),
      type: node.type,
      position,
      data: { label: node.data.label, ...node.data },
    }

    addNodes([newNode])
  }
}

const {
  snapshot,
  undo,
  redo,
  loadFromStorage,
  clear,
  canUndo,
  canRedo,
  exportWorkflow,
  importWorkflow,
} = useWorkflowManager()

const runner = useWorkflowRunner()

function onUpload(event: any) {
  const file = event.files?.[0]
  if (!file) return

  importWorkflow(file)
}

onMounted(() => {
  loadFromStorage()
})

function handleNodeDelete(nodeId: string) {
  removeNodes([nodeId])
  snapshot()
}

function downloadSample(path: string) {
  const link = document.createElement('a')
  link.href = path
  link.download = path.split('/').pop() || 'sample.json'
  link.click()

  console.log('[Sample] Downloaded:', path)
}

const sampleOptions = [
  {
    label: 'New Lead Onboarding',
    icon: 'pi pi-download',
    command: () => downloadSample('/samples/NewOnboarding.json')
  },
  {
    label: 'Abandoned Cart Retargeting',
    icon: 'pi pi-download',
    command: () => downloadSample('/samples/AbandonedCartFlow.json')
  }
]
</script>

<template>
  <div class="h-screen w-screen bg-dark-bg text-main-text flex">
    <NodePalette />
    <div class="flex-1 h-full relative" @drop="onDrop" @dragover="onDragOver">
      <div class="flex gap-2 p-4 absolute top-0 left-0 z-10 w-full">
        <Button severity="secondary" size="small" @click="undo" :disabled="!canUndo()">Undo</Button>
        <Button severity="secondary" size="small" @click="redo" :disabled="!canRedo()">Redo</Button>
        <Button severity="secondary" size="small" @click="clear">Clear</Button>
        <div class="grow"></div>
        <SplitButton
          label="Download Sample"
          icon="pi pi-file"
          :model="sampleOptions"
          severity="secondary"
          size="small"
        />
        <Button severity="secondary" size="small" icon="pi pi-download" label="Export Workflow" @click="exportWorkflow"></Button>
        <FileUpload
          mode="basic"
          name="workflow"
          accept="application/json"
          :maxFileSize="2000000"
          :auto="true"
          :customUpload="true"
          chooseLabel="Import Workflow"
          chooseIcon="pi pi-upload"
          severity="secondary" class="p-button-secondary"
          size="small"
          @uploader="onUpload"
        />
        <Button size="small" icon="pi pi-play" label="Preview Workflow" @click="runner.run"></Button>
      </div>
      <VueFlow :is-valid-connection="isValidConnection" fit-view-on-init @nodes-change="snapshot"
        @edges-change="snapshot" @connect="snapshot" @node-drag-stop="snapshot"
        :nodes-draggable="!runner.isRunning.value"
        :nodes-connectable="!runner.isRunning.value"
        :elements-selectable="!runner.isRunning.value"
        :zoom-on-scroll="!runner.isRunning.value"
        :pane-moveable="!runner.isRunning.value">

        <template #node-trigger="triggerNodeProps">
          <TriggerNode v-bind="triggerNodeProps" @delete="handleNodeDelete" />
        </template>

        <template #node-action="actionNodeProps">
          <ActionNode v-bind="actionNodeProps" @delete="handleNodeDelete" />
        </template>

        <template #node-logic="logicNodeProps">
          <LogicNode v-bind="logicNodeProps" @delete="handleNodeDelete" />
        </template>

        <template #node-utility="utilityNodeProps">
          <UtilityNode v-bind="utilityNodeProps" @delete="handleNodeDelete" />
        </template>
        <Background />
      </VueFlow>
    </div>
    <NodeConfigForm :selected-node="selectedNode" :is-open="isConfigOpen" @update:node="handleNodeUpdate"
      @close="isConfigOpen = false" />
  </div>
</template>