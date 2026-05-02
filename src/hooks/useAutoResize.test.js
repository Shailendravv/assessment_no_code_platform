// Feature: pipeline-builder-ui, Property 6: Auto-resize respects minimum dimensions

import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import useAutoResize from './useAutoResize';

// ---------------------------------------------------------------------------
// Property 6: Auto-resize respects minimum dimensions
// Validates: Requirements 3.1, 3.2
//
// In JSDOM (Jest), scrollWidth and scrollHeight are always 0, so the hook
// must clamp to the provided minimums. This property verifies that for any
// text input, width >= minWidth and height >= minHeight always holds.
// ---------------------------------------------------------------------------
describe('useAutoResize — Property 6: respects minimum dimensions', () => {
  it(
    'always returns width >= 200 and height >= 80 for any text input',
    () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const { result } = renderHook(() =>
            useAutoResize(text, { minWidth: 200, minHeight: 80 }),
          );

          expect(result.current.width).toBeGreaterThanOrEqual(200);
          expect(result.current.height).toBeGreaterThanOrEqual(80);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'respects arbitrary minWidth and minHeight values for any text input',
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer({ min: 50, max: 500 }),
          fc.integer({ min: 30, max: 300 }),
          (text, minWidth, minHeight) => {
            const { result } = renderHook(() =>
              useAutoResize(text, { minWidth, minHeight }),
            );

            expect(result.current.width).toBeGreaterThanOrEqual(minWidth);
            expect(result.current.height).toBeGreaterThanOrEqual(minHeight);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests for useAutoResize — Requirements 3.1, 3.2
// ---------------------------------------------------------------------------
describe('useAutoResize — unit tests', () => {
  it('returns minWidth and minHeight for an empty string', () => {
    const { result } = renderHook(() =>
      useAutoResize('', { minWidth: 200, minHeight: 80 }),
    );

    expect(result.current.width).toBe(200);
    expect(result.current.height).toBe(80);
  });

  it('returns minWidth and minHeight for a short string (JSDOM scrollWidth/Height = 0)', () => {
    const { result } = renderHook(() =>
      useAutoResize('hello', { minWidth: 200, minHeight: 80 }),
    );

    // In JSDOM, scrollWidth and scrollHeight are 0, so minimums apply.
    expect(result.current.width).toBe(200);
    expect(result.current.height).toBe(80);
  });

  it('returns minWidth and minHeight for a very long string (JSDOM clamps to minimums)', () => {
    const longText = 'a'.repeat(10000);
    const { result } = renderHook(() =>
      useAutoResize(longText, { minWidth: 200, minHeight: 80 }),
    );

    // JSDOM always reports scrollWidth/scrollHeight as 0, so minimums apply.
    expect(result.current.width).toBeGreaterThanOrEqual(200);
    expect(result.current.height).toBeGreaterThanOrEqual(80);
  });

  it('returns a textareaRef object', () => {
    const { result } = renderHook(() =>
      useAutoResize('', { minWidth: 200, minHeight: 80 }),
    );

    expect(result.current.textareaRef).toBeDefined();
    expect(result.current.textareaRef).toHaveProperty('current');
  });

  it('uses default minimums when options are not provided', () => {
    const { result } = renderHook(() => useAutoResize(''));

    expect(result.current.width).toBeGreaterThanOrEqual(200);
    expect(result.current.height).toBeGreaterThanOrEqual(80);
  });

  it('returns updated dimensions when text changes', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useAutoResize(text, { minWidth: 200, minHeight: 80 }),
      { initialProps: { text: '' } },
    );

    expect(result.current.width).toBe(200);
    expect(result.current.height).toBe(80);

    rerender({ text: 'new content' });

    // Dimensions should still be at least the minimums.
    expect(result.current.width).toBeGreaterThanOrEqual(200);
    expect(result.current.height).toBeGreaterThanOrEqual(80);
  });
});
