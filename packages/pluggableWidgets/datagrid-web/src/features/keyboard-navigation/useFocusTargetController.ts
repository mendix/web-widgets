import { useRef, useMemo } from "react";
import { FocusTargetController } from "./FocusTargetController";
import { VirtualGridLayout } from "./VirtualGridLayout";
import { PositionController } from "./PositionController";

export type LayoutProps = { rows: number; columns: number; pageSize: number };

export function useFocusTargetController({ rows, columns, pageSize }: LayoutProps): FocusTargetController {
    const controllerRef = useRef<null | FocusTargetController>(null);

    return useMemo<FocusTargetController>(() => {
        const layout = new VirtualGridLayout(rows, columns, pageSize);
        if (controllerRef.current === null) {
            controllerRef.current = new FocusTargetController(new PositionController(), layout);
        } else {
            controllerRef.current.updateGridLayout(layout);
        }
        return controllerRef.current;
    }, [rows, columns, pageSize]);
}
