import { SingleSelector, Status, CaptionsProvider, OptionsProvider } from "../../types";
import {
    CheckboxRadioSelectionPreviewProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../../typings/CheckboxRadioSelectionProps";
import { PreviewCaptionsProvider } from "../../Preview/PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../Preview/PreviewOptionsProvider";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { getCustomCaption } from "../../utils";

export class StaticPreviewSelector implements SingleSelector {
    type = "single" as const;
    status: Status = "available";
    attributeType?: "string" | "boolean" | "big" | "date" | undefined;
    selectorType?: "context" | "database" | "static" | undefined;
    controlType: "checkbox" | "radio" = "radio";
    readOnly: boolean;
    validation?: string | undefined;
    clearable: boolean = false;
    currentId: string | null;
    customContentType: OptionsSourceCustomContentTypeEnum;
    caption: CaptionsProvider;
    options: OptionsProvider;

    constructor(props: CheckboxRadioSelectionPreviewProps) {
        this.currentId = `single-${generateUUID()}`;
        this.customContentType = props.optionsSourceCustomContentType;
        this.readOnly = props.readOnly;
        this.caption = new PreviewCaptionsProvider(new Map(), getCustomCaption(props));
        this.options = new PreviewOptionsProvider(this.caption, new Map());
    }

    updateProps(): void {}
    setValue(): void {}
}
