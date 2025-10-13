import { SelectionHelper, SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { makeAutoObservable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type Props = Pick<
    DatagridContainerProps,
    "exportDialogLabel" | "cancelExportLabel" | "selectRowLabel" | "selectAllRowsLabel" | "itemSelection" | "onClick"
>;

type Gate = DerivedPropsGate<Props>;

/**
 * This is basic data class, just a props mapper.
 * Don't add any state or complex logic.
 * Don't use this class to share instances. Use context.
 */
export class GridBasicData {
    private gate: Gate;
    private selectionHelper: SelectionHelper | null = null;

    constructor(gate: Gate) {
        this.gate = gate;
        makeAutoObservable(this);
    }

    get exportDialogLabel(): string | undefined {
        return this.gate.props.exportDialogLabel?.value;
    }

    get cancelExportLabel(): string | undefined {
        return this.gate.props.cancelExportLabel?.value;
    }

    get selectRowLabel(): string | undefined {
        return this.gate.props.selectRowLabel?.value;
    }

    get selectAllRowsLabel(): string | undefined {
        return this.gate.props.selectAllRowsLabel?.value;
    }

    get gridInteractive(): boolean {
        return !!(this.gate.props.itemSelection || this.gate.props.onClick);
    }

    get selectionStatus(): SelectionStatus {
        return this.selectionHelper?.type === "Multi" ? this.selectionHelper.selectionStatus : "none";
    }
}
