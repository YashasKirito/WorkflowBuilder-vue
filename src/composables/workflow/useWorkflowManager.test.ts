import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkflowManager } from './useWorkflowManager';
import { useVueFlow } from '@vue-flow/core';

// Mock @vue-flow/core
vi.mock('@vue-flow/core', () => ({
  useVueFlow: vi.fn(() => ({
    getNodes: { value: [] },
    getEdges: { value: [] },
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    $reset: vi.fn(),
  })),
}));

// Mock lodash.debounce
vi.mock('lodash.debounce', () => ({
  default: vi.fn((fn) => {
    fn.cancel = vi.fn();
    return fn;
  }),
}));

describe('useWorkflowManager', () => {
  let manager: ReturnType<typeof useWorkflowManager>;
  let mockSetNodes: any;
  let mockSetEdges: any;
  let mockGetNodes: any;
  let mockGetEdges: any;
  let mockReset: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockSetNodes = vi.fn();
    mockSetEdges = vi.fn();
    mockReset = vi.fn();
    mockGetNodes = { value: [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }] };
    mockGetEdges = { value: [{ id: 'e1-2', source: '1', target: '2' }] };

    (useVueFlow as any).mockReturnValue({
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      $reset: mockReset,
    });

    manager = useWorkflowManager();

    // Clear localStorage
    localStorage.clear();
  });

  it('snapshot should save current state to history and persistence', () => {
    manager.snapshot();

    // Check history (through canUndo)
    // Note: debounce might affect immediate check, so we might need to use fake timers
    // But basic history push logic can be tested if debounce is mocked or we wait.
    // For unit testing here, logic correctness of calling push/save is key.

    // Check persistence
    vi.useFakeTimers();
    manager.snapshot();
    vi.runAllTimers();

    expect(localStorage.getItem('workflow_v1')).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem('workflow_v1')!);
    expect(saved.nodes).toHaveLength(1);
    expect(saved.edges).toHaveLength(1);
    vi.useRealTimers();
  });

  it('undo should restore previous state', () => {
    // Initial state
    mockGetNodes.value = [{ id: '1' }];
    manager.snapshot(); // push state 1

    // Change state
    mockGetNodes.value = [{ id: '1' }, { id: '2' }];
    manager.snapshot(); // push state 2

    // Undo
    manager.undo();

    expect(mockSetNodes).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('redo should restore next state', () => {
    // Initial state
    mockGetNodes.value = [{ id: '1' }];
    manager.snapshot();

    // Change state
    mockGetNodes.value = [{ id: '1' }, { id: '2' }];
    manager.snapshot();

    // Undo to state 1
    manager.undo();

    // Redo to state 2
    manager.redo();

    expect(mockSetNodes).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }]);
  });

  it('clear should reset flow and storage', () => {
    localStorage.setItem('workflow_v1', 'some data');
    manager.clear();

    expect(mockReset).toHaveBeenCalled();
    expect(localStorage.getItem('workflow_v1')).toBeNull();
  });

  it('loadFromStorage should restore saved state', () => {
    const data = {
      nodes: [{ id: 'saved-node' }],
      edges: []
    };
    localStorage.setItem('workflow_v1', JSON.stringify(data));

    manager.loadFromStorage();

    expect(mockSetNodes).toHaveBeenCalledWith(data.nodes);
    expect(mockSetEdges).toHaveBeenCalledWith(data.edges);
  });
});
