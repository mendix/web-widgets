import { OptionsSourceStaticDataSourcePreviewType, StaticDataSourceCustomContentTypeEnum } from "typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../../types";
import { CaptionContent } from "../../utils";
import { createElement, ReactNode } from "react";

export class StaticPreviewCaptionsProvider implements CaptionsProvider {
    emptyCaption = "Combo box";
    constructor(
        private optionsMap: Map<string, OptionsSourceStaticDataSourcePreviewType>,
        private customContentType: StaticDataSourceCustomContentTypeEnum,
        private dataSourcePlaceholder: string
    ) {}

    get(value: string | null): string {
        if (value === null) {
            return this.emptyCaption;
        }
        return this.optionsMap.get(value)?.staticDataSourceCaption || this.emptyCaption;
    }

    render(value: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        // always render custom content dropzone in design mode if type is options only
        if (value === null) {
            return <div>{this.dataSourcePlaceholder}</div>;
        }
        const item = this.optionsMap.get(value)!.staticDataSourceCustomContent!;
        const ItemRenderer = item.renderer;
        return this.customContentType === "no" ||
            (placement === "label" && this.customContentType === "listItem") ||
            value === null ? (
            <CaptionContent htmlFor={htmlFor}>{this.get(value)}</CaptionContent>
        ) : (
            <div className="widget-combobox-caption-custom">
                <ItemRenderer caption={`Custom content for ${this.get(value)}`}>
                    <div></div>
                </ItemRenderer>
            </div>
        );
    }
}
