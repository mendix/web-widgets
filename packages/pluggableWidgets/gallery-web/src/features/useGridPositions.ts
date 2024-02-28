import { ObjectItem } from "mendix";
import { useEffect, useState } from "react";
import { GalleryProps } from "../components/Gallery";

export type GridPositionsProps = Pick<GalleryProps<ObjectItem>, "desktopItems" | "phoneItems" | "tabletItems"> & {
    totalItems: number;
};

export type Positions = {
    columnIndex: number;
    rowIndex: number;
};
type GridPositionsReturn = {
    numberOfColumns: number;
    numberOfRows: number;
};

function useWindowWidth(): number {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const updateWidth = (event: UIEvent): void => setWidth((event.target as Window).innerWidth);

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

function mapNumberOfColumns(config: GridPositionsProps, breakpoint: Breakpoint): number {
    return config[`${breakpoint}Items`];
}

function getRowIndex(numberOfColumns: number, index: number): number {
    return Math.floor(index / numberOfColumns);
}

export function getPosition(numberOfColumns: number, totalItems: number, index: number): Positions {
    if (index < 0 || index >= totalItems) {
        return { columnIndex: -1, rowIndex: -1 };
    }

    const columnIndex = index % numberOfColumns;
    const rowIndex = getRowIndex(numberOfColumns, index);
    return { columnIndex, rowIndex };
}

export function useGridPositions(config: GridPositionsProps): GridPositionsReturn {
    const width = useWindowWidth();
    const breakpoint = mapBreakpoint(width);
    const numberOfColumns = mapNumberOfColumns(config, breakpoint);
    const numberOfRows = Math.ceil(config.totalItems / numberOfColumns);

    return {
        numberOfColumns: Math.min(numberOfColumns, config.totalItems),
        numberOfRows
    };
}
