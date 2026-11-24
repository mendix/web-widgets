import { makeAutoObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Translations } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";

export class TextsService {
    constructor(private gate: DerivedPropsGate<MainGateProps>) {
        makeAutoObservable(this);
    }

    private get props(): MainGateProps {
        return this.gate.props;
    }

    private translate<K extends keyof Translations>(key: K, ...params: Translations[K]): string {
        return this.props.texts.translate(key, ...params);
    }

    get exportDialogLabel(): string {
        return this.translate("exportDialogLabel");
    }

    get cancelExportLabel(): string {
        return this.translate("cancelExportLabel");
    }

    get selectRowLabel(): string {
        return this.translate("selectRowLabel");
    }

    get selectAllRowsLabel(): string {
        return this.translate("selectAllRowsLabel");
    }

    get singleSelectionColumnLabel(): string {
        return this.translate("singleSelectionColumnLabel");
    }

    get selectingAllLabel(): string {
        return this.translate("selectingAllLabel");
    }

    get cancelSelectionLabel(): string {
        return this.translate("cancelSelectionLabel");
    }

    get headerAriaLabel(): string {
        return this.translate("filterSectionTitle");
    }

    get loadMoreButtonCaption(): string | undefined {
        return this.props.loadMoreButtonCaption?.value;
    }
}
