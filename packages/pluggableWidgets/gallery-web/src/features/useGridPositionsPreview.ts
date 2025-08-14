import { ObjectItem } from "mendix";
import { useEffect, useState, useRef } from "react";
import { GalleryProps } from "../components/Gallery";

export type GridPositionsProps = Pick<GalleryProps<ObjectItem>, "desktopItems" | "phoneItems" | "tabletItems"> & {
    totalItems: number;
};

type GridPositionReturn = {
    numberOfColumns: number;
    numberOfRows: number;
    numberOfItems: number;
};

function useNumberOfRows(): [React.RefObject<HTMLDivElement>, number] {
    const containerRef = useRef<HTMLDivElement>(null);
    const [numberOfColumns, setNumberOfColumns] = useState(12);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current) return;

            setNumberOfColumns(
                getComputedStyle(containerRef.current.querySelector(".widget-gallery-items")!)
                    .getPropertyValue("grid-template-columns")
                    .split(" ").length
            );
        });

        resizeObserver.observe(containerRef.current);

        setNumberOfColumns(containerRef.current.offsetWidth);

        return () => resizeObserver.disconnect();
    }, []);

    return [containerRef, numberOfColumns];
}

export function useGridPositionsPreview(
    config: GridPositionsProps
): GridPositionReturn & { containerRef: React.RefObject<HTMLDivElement> } {
    const [containerRef, numberOfColumns] = useNumberOfRows();
    const maxItems = numberOfColumns * 3;
    const numberOfItems = Math.min(maxItems, config.totalItems);
    const numberOfRows = Math.ceil(numberOfItems / numberOfColumns);

    return {
        containerRef,
        numberOfColumns,
        numberOfRows,
        numberOfItems
    };
}
