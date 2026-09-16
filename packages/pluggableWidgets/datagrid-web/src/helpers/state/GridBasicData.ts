import { makeAutoObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type Props = Pick<DatagridContainerProps, "texts" | "itemSelection" | "onClick">;

type Gate = DerivedPropsGate<Props>;

/** This is basic data class, just a props mapper. Don't add any state or complex logic. */
/** @deprecated use `TextsService` instead */
export class GridBasicData {
    private gate: Gate;

    constructor(gate: Gate) {
        this.gate = gate;
        makeAutoObservable(this);
    }

    get exportDialogLabel(): string {
        return this.gate.props.texts.translate("exportDialogAriaLabel");
    }

    get cancelExportLabel(): string {
        return this.gate.props.texts.translate("cancelExportAriaLabel");
    }

    get selectAllRowsLabel(): string {
        return this.gate.props.texts.translate("selectAllRowsAriaLabel");
    }

    get gridInteractive(): boolean {
        return !!(this.gate.props.itemSelection || this.gate.props.onClick);
    }
}
