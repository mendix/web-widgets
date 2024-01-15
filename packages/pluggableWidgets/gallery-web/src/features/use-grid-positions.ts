import { ObjectItem } from "mendix";
import { useEffect, useState } from "react";
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

function useWindowWidth(): number {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        function updateWidth() {
            setWidth(window.innerWidth);
        }

        window.addEventListener("resize", updateWidth);

        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    return width;
}

type Breakpoint = "desktop" | "tablet" | "phone";

function mapBreakpoint(width: number): Breakpoint {
    if (width < 768) {
        return "phone";
    }

    if (width >= 768 && width < 992) {
        return "tablet";
    }

    return "desktop";
}

function reduceColumnSize(config: GridPositionsProps, breakpoint: Breakpoint): number {
    return config[`${breakpoint}Items`];
}

function getRowIndex(columnSize: number, index: number): number {
    return Math.floor(index / columnSize);
}

function getPosition(columnSize: number, totalItems: number, index: number): Positions {
    if (index < 0 || index >= totalItems) {
        return { columnIndex: -1, rowIndex: -1 };
    }

    const columnIndex = index % totalItems;
    const rowIndex = getRowIndex(columnSize, index);

    return { columnIndex, rowIndex };
}

export function useGridPositions(config: GridPositionsProps): GridPositionsReturn {
    const width = useWindowWidth();
    const breakpoint = mapBreakpoint(width);
    const columnSize = reduceColumnSize(config, breakpoint);
    const rowSize = Math.ceil(config.totalItems / columnSize);

    return { columnSize, rowSize, getPosition: index => getPosition(columnSize, config.totalItems, index) };
}
