// Feature: pipeline-builder-ui, Property 5: Source handle always present

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TextNode } from './textNode';

jest.mock('reactflow', () => ({
  Handle: ({ id, type, position, style }) => (
    <div
      data-testid={`handle-${id}`}
      data-handleid={id}
      data-handletype={type}
      data-handleposition={position}
      style={style}
    />
  ),
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}));

jest.mock('../styles/theme', () => ({
  theme: {
    colors: { surface: '#fff', border: '#ccc', textPrimary: '#000', textMuted: '#666' },
    radii: { node: '8px' },
    font: { family: 'sans-serif', sizeBase: '13px' },
  },
}));

const NODE_ID = 'text-1';

// ---------------------------------------------------------------------------
// Property 5: Source handle always present
// Validates: Requirements 4.6
// ---------------------------------------------------------------------------
describe('TextNode — Property 5: Source handle always present', () => {
  it(
    'always renders exactly one source handle with id text-1-output on the right side',
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          (generatedText) => {
            const { container, unmount } = render(
              <TextNode id={NODE_ID} data={{ text: generatedText }} />,
            );

            // Find all source handles
            const sourceHandles = container.querySelectorAll(
              '[data-handletype="source"]',
            );

            // Must have exactly one source handle
            expect(sourceHandles).toHaveLength(1);

            // That handle must have the correct id
            const outputHandle = container.querySelector(
              `[data-handleid="${NODE_ID}-output"]`,
            );
            expect(outputHandle).not.toBeNull();

            // It must be on the right side
            expect(outputHandle.getAttribute('data-handleposition')).toBe('right');

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests for TextNode
// Requirements: 3.3, 4.1, 4.3, 4.6
// ---------------------------------------------------------------------------
describe('TextNode — unit tests', () => {
  it('renders a textarea element (not an input)', () => {
    const { container } = render(<TextNode id={NODE_ID} data={{ text: 'hello' }} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    // Confirm no <input> element is present
    expect(container.querySelector('input')).toBeNull();
  });

  it('renders a variable handle when {{ varName }} is typed', () => {
    const { container } = render(<TextNode id={NODE_ID} data={{ text: '' }} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{{myVar}}' } });

    const varHandle = container.querySelector(`[data-handleid="${NODE_ID}-myVar"]`);
    expect(varHandle).not.toBeNull();
    expect(varHandle.getAttribute('data-handletype')).toBe('target');
  });

  it('removes the variable handle when the variable is deleted from the text', () => {
    const { container } = render(
      <TextNode id={NODE_ID} data={{ text: '{{myVar}}' }} />,
    );

    // Confirm handle is present initially
    expect(container.querySelector(`[data-handleid="${NODE_ID}-myVar"]`)).not.toBeNull();

    // Clear the textarea so the variable is gone
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    // Variable handle should be gone
    expect(container.querySelector(`[data-handleid="${NODE_ID}-myVar"]`)).toBeNull();
  });

  it('source handle is always present regardless of text content', () => {
    const { container, rerender } = render(
      <TextNode id={NODE_ID} data={{ text: '' }} />,
    );

    // Empty text — source handle present
    expect(
      container.querySelector(`[data-handleid="${NODE_ID}-output"]`),
    ).not.toBeNull();

    // Text with variables — source handle still present
    rerender(<TextNode id={NODE_ID} data={{ text: '{{a}} {{b}} {{c}}' }} />);
    expect(
      container.querySelector(`[data-handleid="${NODE_ID}-output"]`),
    ).not.toBeNull();
    expect(
      container.querySelector(`[data-handleid="${NODE_ID}-output"]`).getAttribute('data-handletype'),
    ).toBe('source');
    expect(
      container.querySelector(`[data-handleid="${NODE_ID}-output"]`).getAttribute('data-handleposition'),
    ).toBe('right');
  });
});
