import { makeAutoObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Translations } from "../../../typings/GalleryProps";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export class TextsService {
    constructor(private gate: DerivedPropsGate<GalleryGateProps>) {
        makeAutoObservable(this);
    }

    private translate<K extends keyof Translations>(key: K, ...params: Translations[K]): string {
        return this.gate.props.texts.translate(key, ...params);
    }

    get headerAriaLabel(): string {
        return this.translate("filterSectionTitle");
    }

    get listboxAriaLabel(): string {
        return this.translate("ariaLabelListBox");
    }

    get emptyMessageAriaLabel(): string {
        return this.translate("emptyMessageTitle");
    }

    get loadMoreCaption(): string | undefined {
        return this.gate.props.loadMoreButtonCaption?.value;
    }
}
