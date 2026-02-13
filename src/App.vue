<script setup lang="ts">
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder.vue';
import Toast from 'primevue/toast';
</script>

<template>
  <main class="bg-dark-bg text-main-text min-h-screen">
    <WorkflowBuilder />
  </main>
  <Toast position="bottom-right" group="br"/>
</template>
