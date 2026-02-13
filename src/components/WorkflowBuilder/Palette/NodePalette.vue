<script setup lang="ts">
import { computed } from 'vue';
import nodesData from '../../../data/nodes.json';
import { type NodeType } from '../../../types/nodes';
import { formatType, getIcon } from '../helpers';

// Can be fetched from API 
const nodes = nodesData;

const groupedNodes = computed(() => {
  return nodes.reduce((acc, node) => {
    const type = node.type as NodeType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(node);
    return acc;
  }, {} as Record<NodeType, typeof nodes>);
});

const onDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  }
};

</script>

<template>
  <aside class="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-sm font-semibold uppercase text-gray-400 tracking-wider">Nodes</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div v-for="(nodes, type) in groupedNodes" :key="type">
        <h3 class="text-xs font-semibold uppercase text-gray-500 mb-3 px-1">{{ formatType(type) }}</h3>
        <div class="space-y-2">
          <div v-for="node in nodes" :key="node.id"
            class="flex items-center gap-3 p-3 bg-gray-800 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-600"
            :draggable="true" @dragstart="onDragStart($event, node)">
            <div class="grid place-items-center w-8 h-8 rounded bg-gray-900 text-accent">
              <i :class="getIcon(type)"></i>
            </div>
            <span class="text-sm font-medium">{{ node.data.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
