import {
    SelectionControlsContainerProps,
    SelectionControlsPreviewProps,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../../typings/SelectionControlsProps";
import { CaptionsProvider, OptionsProvider, SingleSelector, Status } from "../../../helpers/types";
import { getDatasourcePlaceholderText } from "../../../helpers/utils";
import { PreviewCaptionsProvider } from "../../PreviewCaptionsProvider";
import { PreviewOptionsProvider } from "../../PreviewOptionsProvider";

export class DatabasePreviewSelector implements SingleSelector {
    attributeType?: "string" | "big" | "boolean" | "date";
    caption: CaptionsProvider;
    currentId: string | null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    options: OptionsProvider;
    readOnly: boolean;
    selectorType?: "context" | "database" | "static";
    status: Status = "available";
    type = "single" as const;
    validation?: string;
    groupName: string;

    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;

    constructor(props: SelectionControlsPreviewProps) {
        this.caption = new PreviewCaptionsProvider(new Map());
        this.currentId = getDatasourcePlaceholderText(props);
        this.customContentType = props.optionsSourceDatabaseCustomContentType;
        this.options = new PreviewOptionsProvider(this.caption, new Map());
        this.readOnly = props.readOnly;
        this.groupName = `single-selection-${Math.random().toString(36).substring(2, 15)}`;
        // (this.caption as AssociationPreviewCaptionsProvider).updatePreviewProps({
        //     customContentRenderer: props.optionsSourceDatabaseCustomContent.renderer,
        //     customContentType: props.optionsSourceDatabaseCustomContentType
        // });

        if (props.optionsSourceDatabaseCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
    }

    setValue(_: string | null): void {
        throw new Error("Method not implemented.");
    }
    updateProps(_: SelectionControlsContainerProps): void {
        throw new Error("Method not implemented.");
    }
}
