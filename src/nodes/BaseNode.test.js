// Feature: pipeline-builder-ui, Property 1: BaseNode renders exactly the declared handles

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { BaseNode } from './BaseNode';

// Mock reactflow so Handle renders as a plain div with the expected data attributes.
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

// ---------------------------------------------------------------------------
// Arbitrary for a single HandleDescriptor
// ---------------------------------------------------------------------------
const handleDescriptorArb = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
  type: fc.constantFrom('source', 'target'),
  position: fc.constantFrom('left', 'right', 'top', 'bottom'),
});

// ---------------------------------------------------------------------------
// Property 1: BaseNode renders exactly the declared handles
// ---------------------------------------------------------------------------
describe('BaseNode — Property 1: renders exactly the declared handles', () => {
  it(
    'renders exactly one Handle per descriptor with matching id, type, and position',
    () => {
      fc.assert(
        fc.property(
          // Use uniqueArray to avoid duplicate ids (which would cause React key warnings
          // and make the count assertion ambiguous).
          fc.uniqueArray(handleDescriptorArb, {
            selector: (d) => d.id,
            minLength: 0,
            maxLength: 10,
          }),
          (handles) => {
            const { container } = render(
              <BaseNode id="test-node" label="Test" handles={handles}>
                <span>body</span>
              </BaseNode>,
            );

            // Collect all rendered handle divs by their data-handleid attribute.
            const renderedHandles = container.querySelectorAll('[data-handleid]');

            // 1. Exactly one Handle per descriptor — no more, no fewer.
            expect(renderedHandles).toHaveLength(handles.length);

            // 2. Each descriptor has a matching rendered Handle.
            handles.forEach((descriptor) => {
              const el = container.querySelector(
                `[data-handleid="${descriptor.id}"]`,
              );

              // Handle with this id must exist.
              expect(el).not.toBeNull();

              // type must match.
              expect(el.getAttribute('data-handletype')).toBe(descriptor.type);

              // position must match.
              expect(el.getAttribute('data-handleposition')).toBe(
                descriptor.position,
              );
            });
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests for BaseNode — Requirements 1.1, 1.3
// ---------------------------------------------------------------------------

describe('BaseNode — unit tests', () => {
  it('renders the correct label in the header', () => {
    render(
      <BaseNode id="node-1" label="My Label" handles={[]}>
        <span>body</span>
      </BaseNode>,
    );

    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('renders children in the body area', () => {
    render(
      <BaseNode id="node-1" label="Test" handles={[]}>
        <span data-testid="child-content">Hello World</span>
      </BaseNode>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('Hello World');
  });

  it('sets data-selected="true" when selected is true', () => {
    const { container } = render(
      <BaseNode id="node-1" label="Test" handles={[]} selected={true}>
        <span>body</span>
      </BaseNode>,
    );

    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveAttribute('data-selected', 'true');
  });

  it('does not set data-selected when selected is false', () => {
    const { container } = render(
      <BaseNode id="node-1" label="Test" handles={[]} selected={false}>
        <span>body</span>
      </BaseNode>,
    );

    const outerDiv = container.firstChild;
    expect(outerDiv).not.toHaveAttribute('data-selected');
  });

  it('does not set data-selected when selected is undefined', () => {
    const { container } = render(
      <BaseNode id="node-1" label="Test" handles={[]}>
        <span>body</span>
      </BaseNode>,
    );

    const outerDiv = container.firstChild;
    expect(outerDiv).not.toHaveAttribute('data-selected');
  });

  it('renders no handles when handles array is empty', () => {
    const { container } = render(
      <BaseNode id="node-1" label="Test" handles={[]}>
        <span>body</span>
      </BaseNode>,
    );

    const handles = container.querySelectorAll('[data-handleid]');
    expect(handles).toHaveLength(0);
  });
});
