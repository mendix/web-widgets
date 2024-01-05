import { useMemo, useRef } from "react";
import { FocusTargetController } from "./FocusTargetController";
import { VirtualGridLayout } from "./VirtualGridLayout";
import { PositionController } from "./PositionController";

export type LayoutProps = {
    columns: number;
    pageSize: number;
    rows: number;
};

export function useFocusTargetController({ columns, pageSize, rows }: LayoutProps): FocusTargetController {
    const controllerRef = useRef<null | FocusTargetController>(null);

    return useMemo<FocusTargetController>(() => {
        const layout = new VirtualGridLayout(rows, columns, pageSize);

        if (controllerRef.current === null) {
            controllerRef.current = new FocusTargetController(new PositionController(), layout);
        } else {
            controllerRef.current.updateGridLayout(layout);
        }

        return controllerRef.current;
    }, [columns, pageSize, rows]);
}
