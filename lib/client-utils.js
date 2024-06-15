function canDrag() {
    if (typeof window !== 'undefined') {
        const hoverQuery = window.matchMedia('(hover: hover)');
        const pointerQuery = window.matchMedia('(pointer: fine)');
        return hoverQuery.matches && pointerQuery.matches;
    }
    return false;
}

export {
    canDrag,
}
