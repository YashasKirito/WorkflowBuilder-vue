import type { Edge } from "@vue-flow/core"
import { NodeTypes } from "../../types/nodes"

export function createsCycle(source: string, target: string, edges: Edge[]) {
  // Build adjacency list
  const adjacency: any = {}

  edges.forEach((edge) => {
    if (!adjacency[edge.source]) {
      adjacency[edge.source] = []
    }
    adjacency[edge.source].push(edge.target)
  })

  // Add the new connection temporarily
  if (!adjacency[source]) {
    adjacency[source] = []
  }
  adjacency[source].push(target)

  // DFS from target to see if we can reach source
  const visited = new Set()

  function dfs(node: string) {
    if (node === source) return true
    if (visited.has(node)) return false

    visited.add(node)

    const neighbors = adjacency[node] || []
    for (const next of neighbors) {
      if (dfs(next)) return true
    }

    return false
  }

  return dfs(target)
}

export const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const getIcon = (type: string) => {
  switch (type) {
    case NodeTypes.trigger: return 'pi pi-bolt';
    case NodeTypes.action: return 'pi pi-play';
    case NodeTypes.logic: return 'pi pi-cog';
    case NodeTypes.utility: return 'pi pi-hashtag';
    default: return 'pi pi-box';
  }
}