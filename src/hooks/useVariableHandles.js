/**
 * useVariableHandles(nodeId, text)
 *
 * Parses `text` for {{ variableName }} patterns where variableName
 * is a valid JS identifier. Returns a deduplicated, evenly-spaced
 * array of HandleDescriptor objects for use in BaseNode's `handles` prop.
 *
 * Valid JS identifier regex: /^[A-Za-z_$][A-Za-z0-9_$]*$/
 * Extraction regex:          /\{\{\s*([^}]+?)\s*\}\}/g
 */

import { Position } from 'reactflow';

const EXTRACT_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;
const IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * @param {string} nodeId - The ReactFlow node id.
 * @param {string} text   - The current text content to parse for variable patterns.
 * @returns {Array<{id: string, type: 'target', position: Position, style: {top: string}}>}
 */
function useVariableHandles(nodeId, text) {
  // Extract all {{ variableName }} matches from the text.
  const matches = [];
  let match;
  const regex = new RegExp(EXTRACT_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  // Filter to valid JS identifiers and deduplicate (preserving first-seen order).
  const seen = new Set();
  const uniqueValidNames = [];
  for (const name of matches) {
    if (IDENTIFIER_REGEX.test(name) && !seen.has(name)) {
      seen.add(name);
      uniqueValidNames.push(name);
    }
  }

  const n = uniqueValidNames.length;

  // Build HandleDescriptor objects with evenly-spaced top positions.
  return uniqueValidNames.map((variableName, i) => ({
    id: `${nodeId}-${variableName}`,
    type: 'target',
    position: Position.Left,
    style: { top: `${((i + 1) / (n + 1)) * 100}%` },
  }));
}

export default useVariableHandles;
