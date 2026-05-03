import { useState, useEffect, useRef } from 'react';

/**
 * useAutoResize hook
 * Automatically calculates the required width and height for a text area 
 * and its containing node based on the content.
 */
export const useAutoResize = (text, { minWidth = 250, minHeight = 150, maxWidth = 600 } = {}) => {
  const [dimensions, setDimensions] = useState({ width: minWidth, height: minHeight });
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Create a temporary hidden element to measure the text
    const ghost = document.createElement('div');
    const style = window.getComputedStyle(textarea);
    
    // Copy essential styles for measurement
    ghost.style.font = style.font;
    ghost.style.fontSize = style.fontSize;
    ghost.style.fontFamily = style.fontFamily;
    ghost.style.lineHeight = style.lineHeight;
    ghost.style.padding = style.padding;
    ghost.style.whiteSpace = 'pre-wrap';
    ghost.style.wordBreak = 'break-word';
    ghost.style.position = 'absolute';
    ghost.style.visibility = 'hidden';
    ghost.style.top = '-9999px';
    ghost.style.width = 'auto';
    ghost.style.maxWidth = `${maxWidth}px`;
    
    ghost.textContent = text || ' ';
    document.body.appendChild(ghost);

    // Measure
    const measuredWidth = Math.max(ghost.offsetWidth + 40, minWidth); // +40 for some breathing room
    const measuredHeight = Math.max(ghost.offsetHeight + 100, minHeight); // +100 for header/padding overhead

    document.body.removeChild(ghost);

    setDimensions({
      width: Math.min(measuredWidth, maxWidth),
      height: measuredHeight
    });
  }, [text, minWidth, minHeight, maxWidth]);

  return { ...dimensions, textareaRef };
};

export default useAutoResize;
