import { ComponentType, ReactNode } from "react";
import { OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../types";
import { CaptionContent } from "../utils";

export type PreviewContentRenderer = ComponentType<{ children: ReactNode; caption?: string }>;

/** Design mode: the option ids are the captions, and custom content is a dropzone in the input area. */
export class DatasourcePreviewCaptionsProvider implements CaptionsProvider {
    readonly emptyCaption = "Combo box";

    constructor(
        private readonly Renderer: PreviewContentRenderer,
        private readonly customContentType: OptionsSourceAssociationCustomContentTypeEnum
    ) {}

    get(id: string | null): string {
        return id || this.emptyCaption;
    }

    render(id: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        const { Renderer } = this;
        if (placement === "options" || this.customContentType === "no" || id === null) {
            return <CaptionContent htmlFor={htmlFor}>{this.get(id)}</CaptionContent>;
        }
        return (
            <div className="widget-combobox-caption-custom">
                <Renderer caption="CUSTOM CONTENT">
                    <div />
                </Renderer>
            </div>
        );
    }
}
