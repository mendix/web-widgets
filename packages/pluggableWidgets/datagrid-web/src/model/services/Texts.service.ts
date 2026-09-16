import { makeAutoObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MainGateProps } from "../../../typings/MainGateProps";

export class TextsService {
    constructor(private gate: DerivedPropsGate<MainGateProps>) {
        makeAutoObservable(this);
    }

    private get props(): MainGateProps {
        return this.gate.props;
    }

    get exportDialogLabel(): string {
        return this.props.texts.translate("exportDialogAriaLabel");
    }

    get cancelExportLabel(): string {
        return this.props.texts.translate("cancelExportAriaLabel");
    }

    selectRowLabel(rowIndex: number): string {
        return this.props.texts.translate("selectRowAriaLabel", [String(rowIndex)]);
    }

    get selectAllRowsLabel(): string {
        return this.props.texts.translate("selectAllRowsAriaLabel");
    }

    get singleSelectionColumnLabel(): string {
        return this.props.texts.translate("singleSelectionColumnAriaLabel");
    }

    get headerAriaLabel(): string {
        return this.props.texts.translate("filterSectionAriaLabel");
    }

    get loadMoreButtonCaption(): string | undefined {
        return this.props.loadMoreButtonCaption?.value;
    }
}
