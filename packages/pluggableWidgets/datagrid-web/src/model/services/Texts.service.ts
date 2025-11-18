import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { MainGateProps } from "../../../typings/MainGateProps";

export class TextsService {
    constructor(private gate: DerivedPropsGate<MainGateProps>) {
        makeAutoObservable(this);
    }

    private get props(): MainGateProps {
        return this.gate.props;
    }

    get exportDialogLabel(): string | undefined {
        return this.props.exportDialogLabel?.value;
    }

    get cancelExportLabel(): string | undefined {
        return this.props.cancelExportLabel?.value;
    }

    get selectRowLabel(): string | undefined {
        return this.props.selectRowLabel?.value;
    }

    get selectAllRowsLabel(): string | undefined {
        return this.props.selectAllRowsLabel?.value;
    }
}
