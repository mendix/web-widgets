import { ReactElement, ReactNode } from "react";

export type FilterRenderer = (
    renderWrapper: (children: ReactNode) => ReactElement,
    columnIndex: number
) => ReactElement;
