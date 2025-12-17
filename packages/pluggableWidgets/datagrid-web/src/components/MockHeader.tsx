import { ReactNode, useCallback, useEffect } from "react";
import { useColumnsStore, useDatagridConfig, useGridSizeStore } from "../model/hooks/injection-hooks";

export function MockHeader(): ReactNode {
    const columnsStore = useColumnsStore();
    const config = useDatagridConfig();
    const gridSizeStore = useGridSizeStore();
    const resizeCallback = useCallback<ResizeObserverCallback>(
        entries => {
            const container = entries[0].target.parentElement!;
            const sizes = new Map<string, number>();
            container.querySelectorAll<HTMLDivElement>("[data-column-id]").forEach(c => {
                const columnId = c.dataset.columnId;
                if (!columnId) {
                    console.debug("getColumnSizes: can't find id on:", c);
                    return;
                }

                sizes.set(columnId, c.getBoundingClientRect().width);
            });
            gridSizeStore.updateColumnSizes(sizes.values().toArray());
        },
        [gridSizeStore]
    );

    useEffect(() => {
        const observer = new ResizeObserver(resizeCallback);

        columnsStore.visibleColumns.forEach(c => {
            if (c.headerElementRef) observer.observe(c.headerElementRef);
        });

        return () => {
            observer.disconnect();
        };
    }, [resizeCallback, columnsStore.visibleColumns]);

    return (
        <div className={"grid-mock-header"} aria-hidden>
            {config.checkboxColumnEnabled && <div data-column-id="checkboxes" key={"checkboxes"}></div>}
            {columnsStore.visibleColumns.map(c => (
                <div
                    data-column-id={c.columnId}
                    key={c.columnId}
                    // we set header ref here instead of the real header
                    // as this mock header is aligned with CSS grid, so it is more reliable
                    // the real header is aligned programmatically based on this header
                    ref={ref => c.setHeaderElementRef(ref)}
                ></div>
            ))}
            {config.selectorColumnEnabled && <div data-column-id="selector" key={"selector"}></div>}
        </div>
    );
}
