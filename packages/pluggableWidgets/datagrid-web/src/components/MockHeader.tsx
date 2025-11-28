import { GridColumn } from "../typings/GridColumn";
import { ReactNode, useCallback, useEffect, useRef } from "react";

function getColumnSizes(container: HTMLDivElement | null): Map<string, number> {
    const sizes = new Map<string, number>();
    if (container) {
        container.querySelectorAll<HTMLDivElement>("[data-column-id]").forEach(c => {
            const columnId = c.dataset.columnId;
            if (!columnId) {
                console.debug("getColumnSizes: can't find id on:", c);
                return;
            }
            sizes.set(columnId, c.offsetWidth);
        });
    }

    return sizes;
}

interface MockHeaderProps {
    visibleColumns: GridColumn[];
    showCheckboxColumn: boolean;
    showColumnSelectorColumn: boolean;
    updateColumnSizes: (sizes: number[]) => void;
}

export function MockHeader({
    visibleColumns,
    showCheckboxColumn,
    showColumnSelectorColumn,
    updateColumnSizes
}: MockHeaderProps): ReactNode {
    const headerRef = useRef<HTMLDivElement | null>(null);
    const resizeCallback = useCallback<ResizeObserverCallback>(() => {
        updateColumnSizes(getColumnSizes(headerRef.current).values().toArray());
    }, [headerRef, updateColumnSizes]);

    useEffect(() => {
        const observer = new ResizeObserver(resizeCallback);

        if (headerRef.current) {
            observer.observe(headerRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [resizeCallback, headerRef]);

    return (
        <div className={"grid-mock-header"} aria-hidden ref={headerRef}>
            {showCheckboxColumn && <div data-column-id="checkboxes" key={"checkboxes"}></div>}
            {visibleColumns.map(c => (
                <div
                    data-column-id={c.columnId}
                    key={c.columnId}
                    // we set header ref here instead of the real header
                    // as this mock header is aligned with CSS grid, so it is more reliable
                    // the real header is aligned programmatically based on this header
                    ref={ref => c.setHeaderElementRef(ref)}
                ></div>
            ))}
            {showColumnSelectorColumn && <div data-column-id="selector" key={"selector"}></div>}
        </div>
    );
}
