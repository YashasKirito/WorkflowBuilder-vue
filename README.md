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
