/**
 * useAutoResize(text, { minWidth, minHeight })
 *
 * Returns { width, height, textareaRef }.
 *
 * Strategy: a hidden <div> (the "mirror") with identical font/padding
 * settings is kept in sync with the textarea content. Its scrollWidth
 * and scrollHeight drive the node dimensions, clamped to the minimums.
 *
 * The mirror div approach avoids the `scrollHeight` reset problem that
 * occurs when shrinking a textarea by setting `height: 0` first.
 */

import { useRef, useState, useEffect } from 'react';

/**
 * @param {string} text - The current text content of the textarea.
 * @param {{ minWidth: number, minHeight: number }} options - Minimum dimensions.
 * @returns {{ width: number, height: number, textareaRef: React.RefObject }}
 */
function useAutoResize(text, { minWidth = 200, minHeight = 80 } = {}) {
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: minWidth,
    height: minHeight,
  });

  useEffect(() => {
    const textarea = textareaRef.current;

    // Create the mirror div on first run if it doesn't exist yet.
    if (!mirrorRef.current) {
      const mirror = document.createElement('div');
      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.overflow = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.wordBreak = 'break-word';
      // Place off-screen so it doesn't affect layout.
      mirror.style.top = '-9999px';
      mirror.style.left = '-9999px';
      document.body.appendChild(mirror);
      mirrorRef.current = mirror;
    }

    const mirror = mirrorRef.current;

    // Copy font and padding styles from the textarea so the mirror
    // measures the same dimensions the textarea would occupy.
    if (textarea) {
      const computed = window.getComputedStyle(textarea);
      mirror.style.font = computed.font;
      mirror.style.fontSize = computed.fontSize;
      mirror.style.fontFamily = computed.fontFamily;
      mirror.style.fontWeight = computed.fontWeight;
      mirror.style.lineHeight = computed.lineHeight;
      mirror.style.letterSpacing = computed.letterSpacing;
      mirror.style.padding = computed.padding;
      mirror.style.paddingTop = computed.paddingTop;
      mirror.style.paddingRight = computed.paddingRight;
      mirror.style.paddingBottom = computed.paddingBottom;
      mirror.style.paddingLeft = computed.paddingLeft;
      mirror.style.boxSizing = computed.boxSizing;
      mirror.style.width = computed.width !== '0px' ? computed.width : `${minWidth}px`;
    } else {
      // No textarea yet — set a sensible default width for measurement.
      mirror.style.width = `${minWidth}px`;
    }

    // Append a trailing newline so an empty last line is measured correctly.
    mirror.textContent = text + '\n';

    const measuredWidth = Math.max(mirror.scrollWidth, minWidth);
    const measuredHeight = Math.max(mirror.scrollHeight, minHeight);

    setDimensions((prev) => {
      if (prev.width === measuredWidth && prev.height === measuredHeight) {
        return prev; // Avoid unnecessary re-renders.
      }
      return { width: measuredWidth, height: measuredHeight };
    });
  }, [text, minWidth, minHeight]);

  // Clean up the mirror div when the hook unmounts.
  useEffect(() => {
    return () => {
      if (mirrorRef.current) {
        document.body.removeChild(mirrorRef.current);
        mirrorRef.current = null;
      }
    };
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    textareaRef,
  };
}

export default useAutoResize;
