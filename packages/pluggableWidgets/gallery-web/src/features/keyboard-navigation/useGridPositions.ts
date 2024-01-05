import { ObjectItem } from "mendix";
import { GalleryProps } from "src/components/Gallery";

type GridPositionsProps = Pick<GalleryProps<ObjectItem>, "desktopItems" | "pageSize" | "phoneItems" | "tabletItems">;
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
    pageSize,
    phoneItems,
    tabletItems
}: GridPositionsProps): GridPositionsReturn {
    let columnSize = phoneItems;
    if (window.innerWidth >= 992 && window.innerWidth < 1200) {
        columnSize = tabletItems;
    }
    if (window.innerWidth >= 1200) {
        columnSize = desktopItems;
    }

    const getPosition = (index: number): Positions => {
        if (index < 0 || index >= pageSize) {
            return { columnIndex: -1, rowIndex: -1 };
        }

        const columnIndex = index % pageSize;
        const rowIndex = Math.floor(index / columnSize);

        return { columnIndex, rowIndex };
    };

    return { columnSize, rowSize: pageSize / columnSize, getPosition };
}
