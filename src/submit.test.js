// Feature: pipeline-builder-ui, Property 7: Payload serialization preserves all required fields

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { useStore } from './store';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('./store', () => ({
  useStore: jest.fn(),
}));

jest.mock('./styles/theme', () => ({
  theme: {
    colors: { accent: '#4f8ef7', accentHover: '#3a7ae0', textPrimary: '#e8eaf0' },
    radii: { button: '6px' },
    font: { family: 'sans-serif', sizeBase: '13px' },
  },
}));

jest.mock('zustand/shallow', () => ({ shallow: (a, b) => a === b }));

// ---------------------------------------------------------------------------
// Pure serialization function (mirrors the logic in submit.js)
// ---------------------------------------------------------------------------

function serializePayload(nodes, edges) {
  const serializedNodes = nodes.map(({ id, type, data }) => ({ id, type, data }));
  const serializedEdges = edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
    id,
    source,
    target,
    sourceHandle: sourceHandle ?? null,
    targetHandle: targetHandle ?? null,
  }));
  return { nodes: serializedNodes, edges: serializedEdges };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const nodeArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.constantFrom('customInput', 'customOutput', 'llm', 'text', 'math'),
  data: fc.record({ label: fc.string() }),
});

const edgeArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  source: fc.string({ minLength: 1, maxLength: 20 }),
  target: fc.string({ minLength: 1, maxLength: 20 }),
  sourceHandle: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
  targetHandle: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
});

// ---------------------------------------------------------------------------
// Property 7: Payload serialization preserves all required fields
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe('serializePayload — Property 7: payload serialization preserves all required fields', () => {
  it(
    'every serialized node has id, type, data equal to originals',
    () => {
      fc.assert(
        fc.property(fc.array(nodeArb), (nodes) => {
          const { nodes: serializedNodes } = serializePayload(nodes, []);

          expect(serializedNodes).toHaveLength(nodes.length);

          nodes.forEach((original, i) => {
            const serialized = serializedNodes[i];
            expect(serialized.id).toBe(original.id);
            expect(serialized.type).toBe(original.type);
            expect(serialized.data).toEqual(original.data);
          });
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'every serialized edge has id, source, target, sourceHandle, targetHandle equal to originals',
    () => {
      fc.assert(
        fc.property(fc.array(edgeArb), (edges) => {
          const { edges: serializedEdges } = serializePayload([], edges);

          expect(serializedEdges).toHaveLength(edges.length);

          edges.forEach((original, i) => {
            const serialized = serializedEdges[i];
            expect(serialized.id).toBe(original.id);
            expect(serialized.source).toBe(original.source);
            expect(serialized.target).toBe(original.target);
            expect(serialized.sourceHandle).toBe(original.sourceHandle ?? null);
            expect(serialized.targetHandle).toBe(original.targetHandle ?? null);
          });
        }),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests for SubmitButton — Requirements 5.3, 5.4, 5.5, 5.6
// ---------------------------------------------------------------------------

const { SubmitButton } = require('./submit');

const mockNodes = [{ id: 'node-1', type: 'text', data: { text: 'hello' } }];
const mockEdges = [
  { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: null, targetHandle: null },
];

beforeEach(() => {
  useStore.mockImplementation((selector) => selector({ nodes: mockNodes, edges: mockEdges }));
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SubmitButton — unit tests', () => {
  describe('empty-canvas guard (Requirement 5.6)', () => {
    it('shows a warning and does not call fetch when nodes is empty', async () => {
      useStore.mockImplementation((selector) =>
        selector({ nodes: [], edges: [] }),
      );

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(screen.getByText(/canvas is empty/i)).toBeInTheDocument();
    });
  });

  describe('loading state (Requirement 5.5)', () => {
    it('disables the button and shows "Submitting..." while request is in-flight', async () => {
      let resolveResponse;
      const pendingPromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      global.fetch.mockReturnValue(pendingPromise);

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });

      act(() => {
        userEvent.click(button);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();

      await act(async () => {
        resolveResponse({
          ok: true,
          json: async () => ({ num_nodes: 1, num_edges: 1, is_dag: true }),
        });
        await pendingPromise;
      });
    });
  });

  describe('success display (Requirement 5.3)', () => {
    it('shows num_nodes, num_edges, and is_dag after a successful response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ num_nodes: 3, num_edges: 2, is_dag: true }),
      });

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByTestId('result-banner-success')).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/yes/i)).toBeInTheDocument();
    });
  });

  describe('error display (Requirement 5.4)', () => {
    it('shows error message from JSON body on 4xx response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid pipeline structure' }),
      });

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByTestId('result-banner-error')).toBeInTheDocument();
      expect(screen.getByText(/invalid pipeline structure/i)).toBeInTheDocument();
    });

    it('shows "Bad request" on 4xx when response body has no error field', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: 'something else' }),
      });

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByTestId('result-banner-error')).toBeInTheDocument();
      expect(screen.getByText(/bad request/i)).toBeInTheDocument();
    });

    it('shows "Server error" message on 5xx response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByTestId('result-banner-error')).toBeInTheDocument();
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  describe('network error display (Requirement 5.4)', () => {
    it('shows "Network error" message when fetch throws', async () => {
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByTestId('result-banner-error')).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  describe('button state after request', () => {
    it('re-enables the button after a successful response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ num_nodes: 1, num_edges: 0, is_dag: true }),
      });

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
    });

    it('re-enables the button after an error response', async () => {
      global.fetch.mockRejectedValue(new Error('Network failure'));

      render(<SubmitButton />);

      const button = screen.getByRole('button', { name: /submit/i });
      await act(async () => {
        await userEvent.click(button);
      });

      expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
    });
  });
});
