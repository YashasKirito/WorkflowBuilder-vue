import type { Node } from "@vue-flow/core";
import type { Field } from "./fields";

export const NodeTypes = {
  trigger: "trigger",
  action: "action",
  logic: "logic",
  utility: "utility",
} as const;

export type NodeType = (typeof NodeTypes)[keyof typeof NodeTypes];

export type CustomNodeData = {
  label: string;
  configuration?: Record<string, Field>;
  status?: string;
};

export type CustomNodeEvents = any;

export type CustomNode = Node<CustomNodeData, CustomNodeEvents, NodeType>;
