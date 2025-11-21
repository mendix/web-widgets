import { ComputedAtom, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { reaction } from "mobx";
import { FocusTargetController } from "./FocusTargetController";
import { PositionController } from "./PositionController";
import { VirtualGridLayout } from "./VirtualGridLayout";

/** @injectable */
export function createFocusController(
    host: SetupComponentHost,
    layout: ComputedAtom<VirtualGridLayout>
): FocusTargetController {
    const controller = new FocusTargetController(new PositionController(), layout.get());

    function setup(): void | (() => void) {
        return reaction(
            () => layout.get(),
            newLayout => controller.updateGridLayout(newLayout)
        );
    }

    host.add({ setup });

    return controller;
}
