import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { CSSProperties, ReactNode } from "react";

export class EmptyPlaceholderViewModel {
    constructor(
        private widgets: ComputedAtom<ReactNode>,
        private visibleColumnsCount: ComputedAtom<number>,
        private config: { checkboxColumnEnabled: boolean; selectorColumnEnabled: boolean }
    ) {
        makeAutoObservable(this);
    }

    get content(): ReactNode {
        return this.widgets.get();
    }

    get span(): number {
        let span = this.visibleColumnsCount.get();
        if (this.config.checkboxColumnEnabled) {
            span += 1;
        }
        if (this.config.selectorColumnEnabled) {
            span += 1;
        }
        return Math.max(span, 1);
    }

    get style(): CSSProperties {
        return { gridColumn: `span ${this.span}` };
    }
}
