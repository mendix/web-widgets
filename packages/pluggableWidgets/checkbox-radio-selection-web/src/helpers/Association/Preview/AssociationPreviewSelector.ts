import {
    CheckboxRadioSelectionPreviewProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../../typings/CheckboxRadioSelectionProps";
import { PreviewCaptionsProvider } from "../../Preview/PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../Preview/PreviewOptionsProvider";
import { CaptionsProvider, OptionsProvider, SingleSelector, Status } from "../../types";
import { getCustomCaption } from "../../utils";

export class AssociationPreviewSelector implements SingleSelector {
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
        this.readOnly = props.readOnly;
        this.currentId = `PREVIEW_OPTION`;
        this.customContentType = props.optionsSourceCustomContentType;
        this.readOnly = props.readOnly;
        this.controlType = props.controlType;
        this.caption = new PreviewCaptionsProvider(new Map(), getCustomCaption(props));
        this.options = new PreviewOptionsProvider(this.caption, new Map());
        (this.caption as PreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceAssociationCustomContent?.renderer,
            customContentType: props.optionsSourceCustomContentType
        });
    }

    updateProps(): void {}
    setValue(): void {}
}
