import { ReactNode } from "react";
import {
    OptionsSourceStaticDataSourcePreviewType,
    StaticDataSourceCustomContentTypeEnum
} from "../../../typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../types";
import { CaptionContent } from "../utils";

/** Design mode: the entry captions, with a dropzone per entry for custom content. */
export class StaticPreviewCaptionsProvider implements CaptionsProvider {
    readonly emptyCaption = "Combo box";

    constructor(
        private readonly entries: OptionsSourceStaticDataSourcePreviewType[],
        private readonly customContentType: StaticDataSourceCustomContentTypeEnum,
        private readonly placeholder: string
    ) {}

    get(id: string | null): string {
        if (id === null) {
            return this.emptyCaption;
        }
        return this.entries[Number(id)]?.staticDataSourceCaption || this.emptyCaption;
    }

    render(id: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        if (id === null) {
            return <div>{this.placeholder}</div>;
        }
        const { customContentType } = this;
        if (customContentType === "no" || (placement === "label" && customContentType === "listItem")) {
            return <CaptionContent htmlFor={htmlFor}>{this.get(id)}</CaptionContent>;
        }
        const Renderer = this.entries[Number(id)].staticDataSourceCustomContent!.renderer;
        return (
            <div className="widget-combobox-caption-custom">
                <Renderer caption={`Custom content for ${this.get(id)}`}>
                    <div />
                </Renderer>
            </div>
        );
    }
}
