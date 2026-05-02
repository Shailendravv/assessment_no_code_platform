// Unit tests for MathNode
// Requirements: 1.4, 1.5

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MathNode } from './MathNode';

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

const NODE_ID = 'math-1';

describe('MathNode — handle rendering (Requirements 1.4, 1.5)', () => {
  it('renders exactly two target handles and one source handle', () => {
    const { container } = render(<MathNode id={NODE_ID} data={{}} />);

    const allHandles = container.querySelectorAll('[data-handleid]');
    expect(allHandles).toHaveLength(3);

    const targetHandles = container.querySelectorAll('[data-handletype="target"]');
    expect(targetHandles).toHaveLength(2);

    const sourceHandles = container.querySelectorAll('[data-handletype="source"]');
    expect(sourceHandles).toHaveLength(1);
  });

  it('renders target handle for input A with correct id and position', () => {
    const { container } = render(<MathNode id={NODE_ID} data={{}} />);

    const handleA = container.querySelector(`[data-handleid="${NODE_ID}-a"]`);
    expect(handleA).not.toBeNull();
    expect(handleA.getAttribute('data-handletype')).toBe('target');
    expect(handleA.getAttribute('data-handleposition')).toBe('left');
  });

  it('renders target handle for input B with correct id and position', () => {
    const { container } = render(<MathNode id={NODE_ID} data={{}} />);

    const handleB = container.querySelector(`[data-handleid="${NODE_ID}-b"]`);
    expect(handleB).not.toBeNull();
    expect(handleB.getAttribute('data-handletype')).toBe('target');
    expect(handleB.getAttribute('data-handleposition')).toBe('left');
  });

  it('renders source handle for result with correct id and position', () => {
    const { container } = render(<MathNode id={NODE_ID} data={{}} />);

    const handleResult = container.querySelector(`[data-handleid="${NODE_ID}-result"]`);
    expect(handleResult).not.toBeNull();
    expect(handleResult.getAttribute('data-handletype')).toBe('source');
    expect(handleResult.getAttribute('data-handleposition')).toBe('right');
  });
});

describe('MathNode — operator select (Requirements 1.4, 1.5)', () => {
  it('renders a select element with all four operator options', () => {
    render(<MathNode id={NODE_ID} data={{}} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(['+', '-', '×', '÷']);
  });

  it('renders the four operator option labels', () => {
    render(<MathNode id={NODE_ID} data={{}} />);

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
    expect(screen.getByText('÷')).toBeInTheDocument();
  });

  it('defaults to the + operator', () => {
    render(<MathNode id={NODE_ID} data={{}} />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('+');
  });
});
