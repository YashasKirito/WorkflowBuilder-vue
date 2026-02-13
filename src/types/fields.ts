export const FieldTypes = {
  text: "text",
  number: "number",
  boolean: "boolean",
  select: "select",
} as const;

export type FieldType = (typeof FieldTypes)[keyof typeof FieldTypes];

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For select fields
  value?: string | number | boolean | string[]; // Value can be of different types based on the field type
  required?: boolean;
}
