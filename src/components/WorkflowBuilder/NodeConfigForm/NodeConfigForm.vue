<script setup lang="ts">
import { watch, computed } from 'vue';
import { useForm } from 'vee-validate';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import type { CustomNode } from '../../../types/nodes';
import type { Field } from '../../../types/fields';

const props = defineProps<{
  selectedNode: CustomNode | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:node', nodeId: string, data: CustomNode["data"]): void;
  (e: 'close'): void;
}>();

const visible = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value) emit('close');
  },
});

const { handleSubmit, resetForm, values, setFieldValue } = useForm();

// Watch for selectedNode changes to repopulate the form
watch(
  () => props.selectedNode,
  (newNode) => {
    if (newNode && newNode.data && newNode.data.configuration) {
      const initialValues: Record<string, any> = {};
      Object.entries(newNode.data.configuration).forEach(([key, field]) => {
        initialValues[key] = field.value;
      });
      resetForm({ values: initialValues });
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit((values) => {
  if (props.selectedNode) {
    // Construct the updated configuration object
    const updatedConfig: Record<string, Field> = {};
    
    if (props.selectedNode?.data?.configuration) {
         Object.entries(props.selectedNode.data.configuration).forEach(([key, field]) => {
            updatedConfig[key] = {
                ...field,
                value: values[key]
            };
        });
        emit('update:node', props.selectedNode.id, {...props.selectedNode.data, configuration: updatedConfig});
    }
    emit('close');
  }
});
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full md:w-[600px]" header="Node Configuration">
    <div v-if="selectedNode" class="">
      <h2 class="text-xl font-bold mb-4">{{ selectedNode?.data?.label }}</h2>

      <form @submit="onSubmit" class="flex flex-col gap-4">
        <div v-for="(field, key) in selectedNode?.data?.configuration" :key="key" class="flex flex-col gap-2">
          <label :for="field.id" class="font-medium">
            {{ field.label }} 
            <span v-if="field.required" class="text-red-500">*</span>
          </label>

          <!-- Text Field -->
          <InputText
            v-if="field.type === 'text'"
            :id="field.id"
            :model-value="values[key]"
            @update:model-value="setFieldValue(key, $event)"
            :class="{'p-invalid': !values[key] && field.required}" 
            :placeholder="`Enter ${field.label}`"
          />
           <small v-if="field.type === 'text' && !values[key] && field.required" class="text-red-500">
             {{ field.label }} is required.
           </small>

          <!-- Number Field -->
          <InputNumber
            v-if="field.type === 'number'"
            :id="field.id"
            :model-value="values[key]"
            @update:model-value="setFieldValue(key, $event)"
            :class="{'p-invalid': values[key] === null && field.required}"
             mode="decimal"
             showButtons
          />
           <small v-if="field.type === 'number' && values[key] === null && field.required" class="text-red-500">
             {{ field.label }} is required.
           </small>
          
          <!-- Boolean Field -->
          <div v-if="field.type === 'boolean'" class="flex items-center gap-2">
            <Checkbox
              :id="field.id"
              :model-value="values[key]"
              @update:model-value="setFieldValue(key, $event)"
              :binary="true"
            />
            <label :for="field.id" class="cursor-pointer">
              {{ values[key] ? 'Yes' : 'No' }}
            </label>
          </div>

          <!-- Select Field -->
           <Dropdown
            v-if="field.type === 'select'"
            :id="field.id"
             :model-value="values[key]"
             @update:model-value="setFieldValue(key, $event)"
            :options="field.options"
            placeholder="Select an option"
            :class="{'p-invalid': !values[key] && field.required}"
          />
           <small v-if="field.type === 'select' && !values[key] && field.required" class="text-red-500">
             {{ field.label }} is required.
           </small>

        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" @click="emit('close')" />
          <Button label="Save" type="submit" />
        </div>
      </form>
    </div>
    <div v-else class="p-4">
      <p>No node selected.</p>
    </div>
  </Drawer>
</template>
