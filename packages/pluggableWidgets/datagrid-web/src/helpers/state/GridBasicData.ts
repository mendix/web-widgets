import { makeAutoObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type Props = Pick<DatagridContainerProps, "itemSelection" | "onClick">;

type Gate = DerivedPropsGate<Props>;

/** This is basic data class, just a props mapper. Don't add any state or complex logic. */
export class GridBasicData {
    private gate: Gate;

    constructor(gate: Gate) {
        this.gate = gate;
        makeAutoObservable(this);
    }

    get gridInteractive(): boolean {
        return !!(this.gate.props.itemSelection || this.gate.props.onClick);
    }
}
