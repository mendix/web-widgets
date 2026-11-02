import { ComponentType, ReactNode } from "react";
import { OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { CaptionsProvider } from "../types";

export type PreviewContentRenderer = ComponentType<{ children: ReactNode; caption?: string }>;

/** Design mode: the option ids are the captions, and the selected id carries the custom-content dropzone. */
export class DatasourcePreviewCaptionsProvider implements CaptionsProvider {
    readonly emptyCaption = "Combo box";

    constructor(
        private readonly Renderer: PreviewContentRenderer,
        private readonly customContentType: OptionsSourceAssociationCustomContentTypeEnum,
        /** The one id that shows the dropzone: the input area, never the "..." option of an open menu. */
        private readonly selectedId: string
    ) {}

    get(id: string | null): string {
        return id || this.emptyCaption;
    }

    customContent(id: string): ReactNode | undefined {
        if (this.customContentType === "no" || id !== this.selectedId) {
            return undefined;
        }
        const { Renderer } = this;
        return (
            <Renderer caption="CUSTOM CONTENT">
                <div />
            </Renderer>
        );
    }
}
