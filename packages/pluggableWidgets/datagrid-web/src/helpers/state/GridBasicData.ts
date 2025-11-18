import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type Props = Pick<
    DatagridContainerProps,
    "exportDialogLabel" | "cancelExportLabel" | "selectRowLabel" | "selectAllRowsLabel" | "itemSelection" | "onClick"
>;

type Gate = DerivedPropsGate<Props>;

/** This is basic data class, just a props mapper. Don't add any state or complex logic. */
/** @deprecated use `TextsService` instead */
export class GridBasicData {
    private gate: Gate;

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
}
