import { makeAutoObservable } from "mobx";
import { CSSProperties } from "react";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { PagingAlignment, parsePagingAlignment } from "../helpers/pagingAlignment";

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

    /**
     * Alignment of the pagination controls, taken from the "Pagination alignment" design property.
     *
     * Design property selections reach the widget as classes on `props.class`, so this is a computed
     * over that string: changing the property in Studio Pro's design mode updates placement without
     * remounting the widget.
     */
    get pagingAlignment(): PagingAlignment {
        return parsePagingAlignment(this.gate.props.class);
    }

    get style(): CSSProperties | undefined {
        return this.gate.props.style;
    }

    get tabIndex(): number {
        return this.gate.props.tabIndex ?? 0;
    }
}
