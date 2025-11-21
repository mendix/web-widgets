import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { createRef, CSSProperties } from "react";
import { type SelectionMethod } from "../row-interaction/base";

export class WidgetRootViewModel {
    ref = createRef<HTMLDivElement>();

    constructor(
        private gate: DerivedPropsGate<{
            style?: CSSProperties;
            class?: string;
        }>,
        private config: { selectionEnabled: boolean; selectionMethod: SelectionMethod },
        private exportTask: TaskProgressService,
        private selectAllVM: { isOpen: boolean }
    ) {
        makeAutoObservable(this);
    }

    get className(): string | undefined {
        return this.gate.props.class;
    }

    get exporting(): boolean {
        return this.exportTask.inProgress;
    }

    get selecting(): boolean {
        return this.selectAllVM.isOpen;
    }

    get selectable(): boolean {
        return this.config.selectionEnabled;
    }

    get selectionMethod(): SelectionMethod {
        return this.config.selectionMethod;
    }

    get style(): CSSProperties {
        const style = { ...this.gate.props.style };

        if (!this.ref.current) return style;

        if (this.exporting || this.selecting) {
            return {
                ...style,
                height: this.ref.current.offsetHeight
            };
        }

        return style;
    }
}
