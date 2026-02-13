````markdown
# Workflow Builder

Simple node-based workflow builder built with:

- Vue 3
- Vue Flow
- PrimeVue
- TypeScript
- Node.js 22
- pnpm

---

## Requirements

- Node.js v22+
- pnpm

Check versions:

```bash
node -v
pnpm -v
````

---

## Install

```bash
pnpm install
```

---

## Run Dev Server

```bash
pnpm dev
```

---

## Build

```bash
pnpm build
```

---

## Features

* Node creation & deletion
* Single incoming / outgoing connection per handle
* Cycle prevention (DAG only)
* Undo / Redo
* LocalStorage autosave
* Import / Export JSON
* Sample workflow download
* Preview / Play mode
* Logic nodes randomly branch
* Canvas disabled while running

---

## Important Files

### Workflow State

```
/composables/workflow/useWorkflowHistory.ts
```

Undo / Redo snapshots.

```
/composables/workflow/useWorkflowPersistence.ts
```

LocalStorage autosave.

```
/composables/workflow/useWorkflowManager.ts
```

Combines history, persistence, export/import.

```
/composables/workflow/useWorkflowRunner.ts
```

Handles preview execution.

---

## Workflow JSON Format

```json
{
  "version": 1,
  "nodes": [],
  "edges": []
}
```

---

## How to Add a New Node Type

1. **Define the Node Type**

   Edit `src/types/nodes.ts`:

   ```typescript
   export const NodeTypes = {
     // ...
     custom: "custom",
   } as const;
   ```

2. **Create the Node Component**

   Create `src/components/WorkflowBuilder/Nodes/CustomNode.vue`. This component will receive `NodeProps` and should emit `delete` events if needed.

   ```vue
   <script setup lang="ts">
   import { Handle, Position } from '@vue-flow/core';
   // ... imports
   </script>

   <template>
     <div class="custom-node">
       <Handle type="target" :position="Position.Top" />
       <div>{{ data.label }}</div>
       <Handle type="source" :position="Position.Bottom" />
     </div>
   </template>
   ```

3. **Register in WorkflowBuilder**

   Edit `src/components/WorkflowBuilder/WorkflowBuilder.vue` to import and usage the new component.

   ```vue
   <script setup>
   import CustomNode from './Nodes/CustomNode.vue';
   // ...
   </script>

   <template>
     <VueFlow>
       <template #node-custom="props">
         <CustomNode v-bind="props" @delete="handleNodeDelete" />
       </template>
     </VueFlow>
   </template>
   ```

4. **Add to Palette**

   Edit `src/data/nodes.json` to include the new node definition. This determines what appears in the sidebar.

   ```json
   {
     "id": "unique_id",
     "type": "custom",
     "data": {
       "label": "My Custom Node",
       "configuration": {
         "someField": {
           "id": "someField",
           "label": "Some Field",
           "type": "text",
           "value": "default"
         }
       }
     }
   }
   ```

