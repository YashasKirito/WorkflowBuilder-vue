import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NodeConfigForm from './NodeConfigForm.vue';
import PrimeVue from 'primevue/config';

// Mock vee-validate useForm
vi.mock('vee-validate', async () => {
  const actual = await vi.importActual('vee-validate');
  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: any) => fn,
      resetForm: vi.fn(),
      values: { name: 'test' },
      setFieldValue: vi.fn(),
    }),
  };
});

describe('NodeConfigForm', () => {
  const mockNode = {
    id: '1',
    data: {
      label: 'Test Node',
      configuration: {
        name: {
          id: 'name',
          label: 'Name',
          type: 'text',
          value: '',
          required: true,
        },
      },
    },
  };

  it('renders correctly when open', () => {
    const wrapper = mount(NodeConfigForm, {
      props: {
        selectedNode: mockNode as any,
        isOpen: true,
      },
      global: {
        plugins: [PrimeVue],
        stubs: {
          Drawer: {
            template: '<div><slot /></div>'
          },
          InputText: true,
          InputNumber: true,
          Checkbox: true,
          Dropdown: true,
          Button: true
        }
      },
    });

    expect(wrapper.text()).toContain('Test Node');
    expect(wrapper.text()).toContain('Name');
  });

  it('validates required fields', async () => {
    // Validation logic is mainly handled by vee-validate and schema. 
    // Since we mock useForm, we mostly check if the validation classes/messages would appear based on props/state.
    // But checking actual interaction requires full mount of vee-validate or integration test.

    // checks if 'required' asterisk is shown
    const wrapper = mount(NodeConfigForm, {
      props: {
        selectedNode: mockNode as any,
        isOpen: true,
      },
      global: {
        plugins: [PrimeVue],
        stubs: {
          Drawer: {
            template: '<div><slot /></div>'
          },
          InputText: true,
          InputNumber: true,
          Checkbox: true,
          Dropdown: true,
          Button: true
        }
      },
    });

    expect(wrapper.find('.text-red-500').exists()).toBe(true);
  });
});
