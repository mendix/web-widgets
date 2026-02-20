import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { DynamicValue } from "mendix";
import { makeAutoObservable } from "mobx";
import { ReactNode } from "react";

export class EmptyPlaceholderViewModel {
    constructor(
        private gate: DerivedPropsGate<{
            emptyMessageTitle?: DynamicValue<string>;
            emptyPlaceholder?: ReactNode;
        }>,
        private itemCount: ComputedAtom<number>
    ) {
        makeAutoObservable(this);
    }

    get content(): ReactNode {
        if (this.itemCount.get() > 0) {
            return null;
        }
        return this.gate.props.emptyPlaceholder;
    }

    get sectionAriaLabel(): string | undefined {
        return this.gate.props.emptyMessageTitle?.value;
    }
}
