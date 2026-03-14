import { useState, useCallback } from 'react';

const useVirtualScroll = ({ totalItems, rowHeight = 50, containerHeight = 500, buffer = 5 }) => {
    const [scrollTop, setScrollTop] = useState(0);

    const onScroll = useCallback((e) => {
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

    const visibleRows = Math.ceil(containerHeight / rowHeight);

    let startIndex = Math.floor(scrollTop / rowHeight);
    startIndex = Math.max(0, startIndex - buffer);

    const endIndex = Math.min(totalItems, startIndex + visibleRows + 2 * buffer);

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
