import { ReactNode } from "react";
import { CaptionsProvider } from "../helpers/types";
import {
    OptionsSourceStaticDataSourcePreviewType,
    StaticDataSourceCustomContentTypeEnum
} from "../typings/ComboboxProps";

const FALLBACK_CAPTION = "Combo box";

/** Design mode: the entry captions, with a dropzone per entry for custom content. */
export class StaticPreviewCaptionsProvider implements CaptionsProvider {
    constructor(
        private readonly entries: OptionsSourceStaticDataSourcePreviewType[],
        private readonly customContentType: StaticDataSourceCustomContentTypeEnum,
        /** Shown in the input area: nothing is selected in design mode. */
        public readonly emptyCaption: string
    ) {}

    get(id: string | null): string {
        if (id === null) {
            return this.emptyCaption;
        }
        return this.entries[Number(id)]?.staticDataSourceCaption || FALLBACK_CAPTION;
    }

    customContent(id: string): ReactNode | undefined {
        const Renderer = this.entries[Number(id)]?.staticDataSourceCustomContent?.renderer;
        if (this.customContentType === "no" || !Renderer) {
            return undefined;
        }
        return (
            <Renderer caption={`Custom content for ${this.get(id)}`}>
                <div />
            </Renderer>
        );
    }
}
