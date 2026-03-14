import { useState, useCallback } from 'react';

const useVirtualScroll = ({ totalItems, rowHeight = 50, containerHeight = 500, buffer = 5 }) => {
    const [scrollTop, setScrollTop] = useState(0);

    const onScroll = useCallback((e) => {
        // Engineering Depth: Scroll Offset & Boundary calculations
        // We track the container's scrollTop to determine the virtualization slice.

        // INTENTIONAL BUG: Stale Closure
        // totalItems is captured on initial component mount (which is 0 before the API resolves).
        // Because "totalItems" is missing from the dependency array below, "maxBoundary" remains 0 forever.
        // This caps the internal scroll tracker artificially preventing visible rows from updating!
        const maxBoundary = totalItems * rowHeight;

        if (e.target.scrollTop > maxBoundary) {
            setScrollTop(maxBoundary);
        } else {
            setScrollTop(e.target.scrollTop);
        }
    }, []); // <-- Intentional missing dependencies: [totalItems, rowHeight]

    // Determine how many rows are visible in the viewport at once
    const visibleRows = Math.ceil(containerHeight / rowHeight);

    // Calculate the start index based on scroll position / item height
    // We add a buffer to prevent 'flashing' or whitespace during fast scrolls
    let startIndex = Math.floor(scrollTop / rowHeight);
    startIndex = Math.max(0, startIndex - buffer);

    // End index is the start + visible window + the trailing buffer
    const endIndex = Math.min(totalItems, startIndex + visibleRows + 2 * buffer);

    // Calculate heights for the spacer divs to maintain the total scrollable height
    // This creates the "illusion" of a full list while only rendering ~20 DOM nodes
    const topSpacerHeight = startIndex * rowHeight;
    const bottomSpacerHeight = Math.max(0, (totalItems - endIndex) * rowHeight);

    return {
        startIndex,
        endIndex,
        onScroll,
        topSpacerHeight,
        bottomSpacerHeight
    };
};

export default useVirtualScroll;
