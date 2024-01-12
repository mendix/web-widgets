import { ObjectItem } from "mendix";
import { useLayoutEffect, useState } from "react";
import { GalleryProps } from "../components/Gallery";

type GridPositionsProps = Pick<GalleryProps<ObjectItem>, "desktopItems" | "phoneItems" | "tabletItems"> & {
    totalItems: number;
};

export type Positions = {
    columnIndex: number;
    rowIndex: number;
};
type GridPositionsReturn = {
    columnSize: number;
    rowSize: number;
    getPosition: (index: number) => Positions;
};

export function useGridPositions({
    desktopItems,
    phoneItems,
    tabletItems,
    totalItems
}: GridPositionsProps): GridPositionsReturn {
    const [columnSize, setColumnSize] = useState(phoneItems);

    useLayoutEffect(() => {
        function updateColumnSize() {
            if (window.innerWidth < 768) {
                setColumnSize(phoneItems);
            }
            if (window.innerWidth >= 768 && window.innerWidth < 992) {
                setColumnSize(tabletItems);
            }
            if (window.innerWidth >= 992) {
                setColumnSize(desktopItems);
            }
        }

        window.addEventListener("resize", updateColumnSize);
        updateColumnSize();

        return () => window.removeEventListener("resize", updateColumnSize);
    }, []);

    const getPosition = (index: number): Positions => {
        if (index < 0 || index >= totalItems) {
            return { columnIndex: -1, rowIndex: -1 };
        }

        const columnIndex = index % totalItems;
        const rowIndex = Math.floor(index / columnSize);

        return { columnIndex, rowIndex };
    };

    console.info({ columnSize, rowSize: Math.ceil(totalItems / columnSize), totalItems });
    return { columnSize, rowSize: Math.ceil(totalItems / columnSize), getPosition };
}
