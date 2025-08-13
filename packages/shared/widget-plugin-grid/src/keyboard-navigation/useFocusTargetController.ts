import { useMemo, useRef } from "react";
import { FocusTargetController } from "./FocusTargetController";
import { PositionController } from "./PositionController";
import { VirtualGridLayout } from "./VirtualGridLayout";

export type LayoutProps = { rows: number; columns: number; pageSize: number };

/**
 * @returns {FocusTargetController} controller that manages focus targets in a grid layout. Object ref is stable across renders.
 */
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
