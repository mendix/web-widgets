import { SingleSelector, Status, CaptionsProvider, OptionsProvider, MultiSelector } from "../../types";
import {
    CheckboxRadioSelectionPreviewProps,
    OptionsSourceCustomContentTypeEnum
} from "../../../../typings/CheckboxRadioSelectionProps";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { PreviewCaptionsProvider } from "../../Preview/PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../Preview/PreviewOptionsProvider";
import { getCustomCaption } from "../../utils";

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

    constructor(props: CheckboxRadioSelectionPreviewProps) {
        this.currentId = `single-${generateUUID()}`;
        this.customContentType = props.optionsSourceCustomContentType;
        this.readOnly = props.readOnly;
        this.caption = new PreviewCaptionsProvider(new Map(), getCustomCaption(props));
        this.options = new PreviewOptionsProvider(this.caption, new Map());
        (this.caption as PreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceDatabaseCustomContent?.renderer,
            customContentType: props.optionsSourceCustomContentType
        });
        // Show dropzones in design mode when custom content is enabled
    }

    updateProps() {}
    setValue() {}
}

export class DatabaseMultiPreviewSelector implements MultiSelector {
    type = "multi" as const;
    status: Status = "available";
    attributeType?: "string" | "boolean" | "big" | "date" | undefined;
    selectorType?: "context" | "database" | "static" | undefined;
    readOnly: boolean;
    validation?: string | undefined;
    clearable: boolean = false;
    currentId: string[] | null;
    customContentType: OptionsSourceCustomContentTypeEnum;
    caption: CaptionsProvider;
    options: OptionsProvider;

    constructor(props: CheckboxRadioSelectionPreviewProps) {
        this.currentId = [getCustomCaption(props)];
        this.customContentType = props.optionsSourceCustomContentType;
        this.readOnly = props.readOnly;
        this.caption = new PreviewCaptionsProvider(new Map(), getCustomCaption(props));
        this.options = new PreviewOptionsProvider(this.caption, new Map());
        (this.caption as PreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceDatabaseCustomContent?.renderer,
            customContentType: props.optionsSourceCustomContentType
        });
        // Show dropzones in design mode when custom content is enabled
    }
    getOptions(): string[] {
        return this.currentId || [];
    }

    updateProps() {}
    setValue() {}
}
