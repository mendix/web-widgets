import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { makeAutoObservable } from "mobx";
import { createRef, CSSProperties } from "react";
import { ItemSelectionMethodEnum } from "../../../typings/DatagridProps";

export class WidgetRootViewModel {
    ref = createRef<HTMLDivElement>();

    constructor(
        private gate: DerivedPropsGate<{
            style?: CSSProperties;
            class?: string;
        }>,
        private config: { selectionEnabled: boolean; selectionMethod: ItemSelectionMethodEnum },
        private exportTask: TaskProgressService,
        private selectAllTask: TaskProgressService
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
        return this.selectAllTask.inProgress;
    }

    get selectable(): boolean {
        return this.config.selectionEnabled;
    }

    get selectionMethod(): ItemSelectionMethodEnum {
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
