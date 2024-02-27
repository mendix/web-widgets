import { ObjectItem } from "mendix";
import { useEffect, useState } from "react";
import { GalleryProps } from "../components/Gallery";

export type GridPositionsProps = Pick<GalleryProps<ObjectItem>, "desktopItems" | "phoneItems" | "tabletItems"> & {
    totalItems: number;
};

type GridPositionReturn = {
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

export function useGridPositions(config: GridPositionsProps): GridPositionReturn {
    const width = useWindowWidth();
    const breakpoint = mapBreakpoint(width);
    const numberOfColumns = mapNumberOfColumns(config, breakpoint);
    const numberOfRows = Math.ceil(config.totalItems / numberOfColumns);

    return {
        numberOfColumns: Math.min(numberOfColumns, config.totalItems),
        numberOfRows
    };
}
