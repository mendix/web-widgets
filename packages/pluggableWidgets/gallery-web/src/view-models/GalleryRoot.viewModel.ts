import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { CSSProperties } from "react";

export class GalleryRootViewModel {
    constructor(
        private gate: DerivedPropsGate<{
            style?: CSSProperties;
            class?: string;
            tabIndex?: number;
        }>
    ) {
        makeAutoObservable(this);
    }

    get className(): string | undefined {
        return this.gate.props.class;
    }

    get style(): CSSProperties | undefined {
        return this.gate.props.style;
    }

    get tabIndex(): number {
        return this.gate.props.tabIndex ?? 0;
    }
}
