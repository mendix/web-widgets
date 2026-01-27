import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export class TextsService {
    constructor(private gate: DerivedPropsGate<GalleryGateProps>) {
        makeAutoObservable(this);
    }

    get headerAriaLabel(): string | undefined {
        return this.gate.props.filterSectionTitle?.value;
    }

    get listboxAriaLabel(): string | undefined {
        return this.gate.props.ariaLabelListBox?.value;
    }
}
