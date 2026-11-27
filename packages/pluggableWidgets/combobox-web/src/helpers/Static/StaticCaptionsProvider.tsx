import { computed, makeObservable } from "mobx";
import { ReactNode } from "react";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import {
    OptionsSourceAssociationCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../types";
import { CaptionContent } from "../utils";
import { StaticGateProps } from "./gate";

const UNAVAILABLE_CAPTION = "<...>";

export class StaticCaptionsProvider implements CaptionsProvider {
    constructor(
        private readonly gate: DerivedPropsGate<StaticGateProps>,
        private readonly customContentType: OptionsSourceAssociationCustomContentTypeEnum
    ) {
        makeObservable(this, { emptyCaption: computed });
    }

    get emptyCaption(): string {
        const text = this.gate.props.emptyOptionText;
        return !text || text.status === "unavailable" ? "" : (text.value ?? "");
    }

    private entry(id: string): OptionsSourceStaticDataSourceType | undefined {
        return this.gate.props.optionsSourceStaticDataSource[Number(id)];
    }

    /** The empty option shows the attribute's display value when it has one. */
    get(id: string | null): string {
        if (id === null) {
            return this.gate.props.staticAttribute.displayValue || this.emptyCaption;
        }
        const caption = this.entry(id)?.staticDataSourceCaption;
        if (!caption || !caption.status || caption.status === "unavailable") {
            return UNAVAILABLE_CAPTION;
        }
        return caption.value?.toString() || "";
    }

    render(id: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        const { customContentType } = this;
        const plain = customContentType === "no" || (placement === "label" && customContentType === "listItem");
        return plain || id === null ? (
            <CaptionContent htmlFor={htmlFor}>{this.get(id)}</CaptionContent>
        ) : (
            <div className="widget-combobox-caption-custom">{this.entry(id)?.staticDataSourceCustomContent}</div>
        );
    }
}
