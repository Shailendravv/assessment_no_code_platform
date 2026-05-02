// Feature: pipeline-builder-ui, Property 2: Variable handles — one per unique valid identifier
// Feature: pipeline-builder-ui, Property 3: Invalid identifiers produce no handles
// Feature: pipeline-builder-ui, Property 4: Variable handle removal on deletion
// Feature: pipeline-builder-ui, Property 8: Variable handles are evenly spaced

import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import useVariableHandles from './useVariableHandles';

// ---------------------------------------------------------------------------
// Mock reactflow so Position.Left is available in JSDOM
// ---------------------------------------------------------------------------
jest.mock('reactflow', () => ({
  Position: { Left: 'left', Right: 'right' },
}));

// ---------------------------------------------------------------------------
// Shared arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a valid JS identifier string.
 * First character: letter, underscore, or dollar sign.
 * Remaining characters: letters, digits, underscores, or dollar signs.
 */
const validIdentifierArb = fc
  .tuple(
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'.split(''),
    ),
    fc
      .string({ minLength: 0, maxLength: 10 })
      .map((s) => s.replace(/[^a-zA-Z0-9_$]/g, '_')),
  )
  .map(([first, rest]) => first + rest);

/**
 * Builds text containing `count` occurrences of `{{ varName }}`.
 */
const textWithVariable = (varName, count) =>
  Array(count).fill(`{{ ${varName} }}`).join(' ');

// ---------------------------------------------------------------------------
// Property 2: Variable handles — one per unique valid identifier
// Validates: Requirements 4.1, 4.2
// ---------------------------------------------------------------------------
describe('useVariableHandles — Property 2: one handle per unique valid identifier', () => {
  it(
    'returns exactly one handle per unique valid identifier regardless of repetition count',
    () => {
      fc.assert(
        fc.property(
          // Generate 1–5 unique valid identifiers
          fc.uniqueArray(validIdentifierArb, { minLength: 1, maxLength: 5 }),
          // For each identifier, generate a repetition count 1–3
          fc.array(fc.integer({ min: 1, max: 3 }), {
            minLength: 1,
            maxLength: 5,
          }),
          (identifiers, counts) => {
            // Pair each identifier with a repetition count (zip, using min length)
            const pairs = identifiers.map((id, i) => [
              id,
              counts[i] ?? 1,
            ]);

            // Build text containing each identifier the specified number of times
            const text = pairs
              .map(([id, count]) => textWithVariable(id, count))
              .join(' ');

            const { result } = renderHook(() =>
              useVariableHandles('node-1', text),
            );

            // Output length must equal the number of unique valid identifiers
            expect(result.current.length).toBe(identifiers.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 3: Invalid identifiers produce no handles
// Validates: Requirements 4.5
// ---------------------------------------------------------------------------
describe('useVariableHandles — Property 3: invalid identifiers produce no handles', () => {
  it(
    'returns no handle for identifiers starting with a digit',
    () => {
      fc.assert(
        fc.property(
          // Digit-prefixed "identifier": digit followed by letters/digits
          fc.tuple(
            fc.integer({ min: 0, max: 9 }).map(String),
            fc
              .string({ minLength: 0, maxLength: 8 })
              .map((s) => s.replace(/[^a-zA-Z0-9]/g, 'x')),
          ).map(([digit, rest]) => digit + rest),
          (invalidId) => {
            const text = `{{ ${invalidId} }}`;
            const { result } = renderHook(() =>
              useVariableHandles('node-1', text),
            );
            expect(result.current.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'returns no handle for identifiers containing spaces',
    () => {
      fc.assert(
        fc.property(
          // Two valid-looking words separated by a space — not a valid identifier
          fc.tuple(validIdentifierArb, validIdentifierArb).map(
            ([a, b]) => `${a} ${b}`,
          ),
          (invalidId) => {
            const text = `{{ ${invalidId} }}`;
            const { result } = renderHook(() =>
              useVariableHandles('node-1', text),
            );
            // The extraction regex trims whitespace, so "a b" becomes "a b" which
            // fails the identifier regex — no handle should be produced.
            expect(result.current.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'returns no handle for an empty {{ }} pattern',
    () => {
      const { result } = renderHook(() =>
        useVariableHandles('node-1', '{{  }}'),
      );
      expect(result.current.length).toBe(0);
    },
  );
});

// ---------------------------------------------------------------------------
// Property 4: Variable handle removal on deletion
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------
describe('useVariableHandles — Property 4: handle removed when variable is deleted', () => {
  it(
    'produces no handle for a variable after all its occurrences are removed',
    () => {
      fc.assert(
        fc.property(
          validIdentifierArb,
          fc.integer({ min: 1, max: 4 }),
          (varName, count) => {
            // Build text with `count` occurrences of the variable
            const textWithVar = textWithVariable(varName, count);

            // Escape special regex characters in varName before building the removal pattern
            const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Remove all occurrences of {{ varName }} (with any surrounding whitespace)
            const removedText = textWithVar
              .replace(new RegExp(`\\{\\{\\s*${escapedVarName}\\s*\\}\\}`, 'g'), '')
              .trim();

            const { result } = renderHook(() =>
              useVariableHandles('node-1', removedText),
            );

            // No handle for the removed variable name should be present
            const hasHandle = result.current.some(
              (h) => h.id === `node-1-${varName}`,
            );
            expect(hasHandle).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 8: Variable handles are evenly spaced
// Validates: Requirements 4.4
// ---------------------------------------------------------------------------
describe('useVariableHandles — Property 8: handles are evenly spaced', () => {
  it(
    'places handle at index i at top = ((i+1)/(n+1))*100%',
    () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(validIdentifierArb, { minLength: 1, maxLength: 8 }),
          (identifiers) => {
            const text = identifiers
              .map((id) => `{{ ${id} }}`)
              .join(' ');

            const { result } = renderHook(() =>
              useVariableHandles('node-1', text),
            );

            const handles = result.current;
            const n = handles.length;

            // Must have one handle per identifier
            expect(n).toBe(identifiers.length);

            handles.forEach((handle, i) => {
              const expectedTop = `${((i + 1) / (n + 1)) * 100}%`;
              expect(handle.style.top).toBe(expectedTop);
            });
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Unit tests for useVariableHandles
// Requirements: 4.1, 4.2, 4.5
// ---------------------------------------------------------------------------
describe('useVariableHandles — unit tests', () => {
  it('creates one handle for a single valid identifier', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', '{{ myVar }}'),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('node-1-myVar');
    expect(result.current[0].type).toBe('target');
    expect(result.current[0].position).toBe('left');
  });

  it('creates exactly one handle for a duplicate identifier', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', '{{ foo }} {{ foo }} {{ foo }}'),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('node-1-foo');
  });

  it('creates no handle for an identifier starting with a digit', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', '{{ 1invalid }}'),
    );

    expect(result.current).toHaveLength(0);
  });

  it('creates no handle for an identifier containing a space', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', '{{ my var }}'),
    );

    expect(result.current).toHaveLength(0);
  });

  it('creates no handle for an empty {{ }} pattern', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', '{{  }}'),
    );

    expect(result.current).toHaveLength(0);
  });

  it('handles mixed valid and invalid identifiers — only valid ones get handles', () => {
    const text = '{{ validVar }} {{ 9bad }} {{ also_valid }} {{ has space }} {{ _ok }}';
    const { result } = renderHook(() =>
      useVariableHandles('node-1', text),
    );

    // validVar, also_valid, _ok are valid; 9bad and "has space" are not
    expect(result.current).toHaveLength(3);

    const ids = result.current.map((h) => h.id);
    expect(ids).toContain('node-1-validVar');
    expect(ids).toContain('node-1-also_valid');
    expect(ids).toContain('node-1-_ok');
    expect(ids).not.toContain('node-1-9bad');
    expect(ids).not.toContain('node-1-has space');
  });

  it('returns an empty array for text with no {{ }} patterns', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', 'just plain text'),
    );

    expect(result.current).toHaveLength(0);
  });

  it('returns an empty array for an empty string', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-1', ''),
    );

    expect(result.current).toHaveLength(0);
  });

  it('each handle has the correct structure', () => {
    const { result } = renderHook(() =>
      useVariableHandles('node-42', '{{ alpha }} {{ beta }}'),
    );

    expect(result.current).toHaveLength(2);

    result.current.forEach((handle) => {
      expect(handle).toHaveProperty('id');
      expect(handle).toHaveProperty('type', 'target');
      expect(handle).toHaveProperty('position', 'left');
      expect(handle).toHaveProperty('style');
      expect(handle.style).toHaveProperty('top');
    });
  });
});
