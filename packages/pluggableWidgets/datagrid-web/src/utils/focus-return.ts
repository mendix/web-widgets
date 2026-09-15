/**
 * Returns focus to the select-all checkbox after selection is cleared.
 * Falls back to the grid's active cell (roving tabindex) if no checkbox exists.
 */
export function returnFocusToGrid(container: Element | null | undefined): void {
    if (!container) {
        return;
    }
    const widget = container.closest(".widget-datagrid");
    const grid = widget?.querySelector('[role="grid"]') ?? container.closest('[role="grid"]');
    if (!grid) {
        return;
    }
    const checkbox = grid.querySelector<HTMLElement>(".widget-datagrid-col-select input");
    if (checkbox) {
        checkbox.focus();
        return;
    }
    // Fall back to the grid's active cell managed by the roving tabindex pattern.
    const activeCell = grid.querySelector<HTMLElement>(
        '[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"]'
    );
    activeCell?.focus();
}
