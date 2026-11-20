import { makeAutoObservable } from "mobx";
import { ReactNode } from "react";
import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { TextsService } from "../model/services/Texts.service";

export class EmptyPlaceholderViewModel {
    constructor(
        private gate: DerivedPropsGate<{ emptyPlaceholder?: ReactNode }>,
        private itemCount: ComputedAtom<number>,
        private texts: TextsService
    ) {
        makeAutoObservable(this);
    }

    get content(): ReactNode {
        if (this.itemCount.get() > 0) {
            return null;
        }
        return this.gate.props.emptyPlaceholder;
    }

    get sectionAriaLabel(): string {
        return this.texts.emptyMessageAriaLabel;
    }
}
