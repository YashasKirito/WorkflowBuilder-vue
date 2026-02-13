import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkflowRunner } from './useWorkflowRunner';
import { useVueFlow } from '@vue-flow/core';

// Mock PrimeVue useToast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn()
  })
}));

// Mock @vue-flow/core
vi.mock('@vue-flow/core', () => ({
  useVueFlow: vi.fn(),
}));

describe('useWorkflowRunner', () => {
  let runner: ReturnType<typeof useWorkflowRunner>;
  let mockUpdateNode: any;
  let mockGetNodes: any;
  let mockGetEdges: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateNode = vi.fn();
    mockGetNodes = { value: [] };
    mockGetEdges = { value: [] };

    (useVueFlow as any).mockReturnValue({
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
      updateNode: mockUpdateNode,
    });

    runner = useWorkflowRunner();
  });

  it('run should fail if no trigger node', async () => {
    mockGetNodes.value = [];

    await runner.run();

    expect(mockUpdateNode).not.toHaveBeenCalled();
    expect(runner.isRunning.value).toBe(false);
  });

  it('run should execute nodes in order', async () => {
    vi.useFakeTimers();

    const node1 = { id: '1', type: 'trigger', data: { status: 'idle' } };
    const node2 = { id: '2', type: 'action', data: { status: 'idle' } };
    const edge1 = { id: 'e1', source: '1', target: '2' };

    mockGetNodes.value = [node1, node2];
    mockGetEdges.value = [edge1];

    const runPromise = runner.run();

    // It's async due to delays.
    // We can fast-forward timers to simulate execution
    await vi.runAllTimersAsync();
    await runPromise;

    // Trigger should be updated to running then completed
    expect(mockUpdateNode).toHaveBeenCalledWith('1', expect.objectContaining({ data: expect.objectContaining({ status: 'running' }) }));
    expect(mockUpdateNode).toHaveBeenCalledWith('1', expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }));

    // Action should be updated
    expect(mockUpdateNode).toHaveBeenCalledWith('2', expect.objectContaining({ data: expect.objectContaining({ status: 'running' }) }));
    expect(mockUpdateNode).toHaveBeenCalledWith('2', expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }));

    vi.useRealTimers();
  });
});
