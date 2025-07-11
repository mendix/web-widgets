import { SingleSelector, Status, CaptionsProvider, OptionsProvider } from "../../types";
import {
    SelectionControlsPreviewProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../../typings/SelectionControlsProps";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { PreviewCaptionsProvider } from "../../Preview/PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../Preview/PreviewOptionsProvider";

export class DatabasePreviewSelector implements SingleSelector {
    type = "single" as const;
    status: Status = "available";
    attributeType?: "string" | "boolean" | "big" | "date" | undefined;
    selectorType?: "context" | "database" | "static" | undefined;
    // type: "single";
    readOnly: boolean;
    validation?: string | undefined;
    clearable: boolean = false;
    currentId: string | null;
    customContentType: OptionsSourceCustomContentTypeEnum;
    caption: CaptionsProvider;
    options: OptionsProvider;

    constructor(props: SelectionControlsPreviewProps) {
        this.currentId = `single-${generateUUID()}`;
        this.customContentType = props.optionsSourceCustomContentType;
        this.readOnly = props.readOnly;
        this.caption = new PreviewCaptionsProvider(new Map());
        this.options = new PreviewOptionsProvider(this.caption, new Map());
        (this.caption as PreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceDatabaseCustomContent?.renderer,
            customContentType: props.optionsSourceCustomContentType
        });
        // Show dropzones in design mode when custom content is enabled
    }

    updateProps() {}
    setValue() {}
    onEnterEvent() {}
    onLeaveEvent() {}
}
