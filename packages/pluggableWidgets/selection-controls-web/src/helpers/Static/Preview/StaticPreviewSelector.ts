import { SingleSelector, Status, CaptionsProvider, OptionsProvider } from "../../types";
import {
    SelectionControlsPreviewProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../../typings/SelectionControlsProps";
import { PreviewCaptionsProvider } from "../../Preview/PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../Preview/PreviewOptionsProvider";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { getCustomCaption } from "../../utils";

export class StaticPreviewSelector implements SingleSelector {
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
        this.caption = new PreviewCaptionsProvider(new Map(), getCustomCaption(props));
        this.options = new PreviewOptionsProvider(this.caption, new Map());
    }

    updateProps() {}
    setValue() {}
}
