import {
    ComboboxContainerProps,
    ComboboxPreviewProps,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../../typings/ComboboxProps";
import { CaptionsProvider, OptionsProvider, SingleSelector, Status } from "../../../helpers/types";
import { getDatasourcePlaceholderText } from "../../../helpers/utils";
import { AssociationPreviewCaptionsProvider } from "../../Association/Preview/AssociationPreviewCaptionsProvider";
import { AssociationPreviewOptionsProvider } from "../../Association/Preview/AssociationPreviewOptionsProvider";

export class DatabasePreviewSelector implements SingleSelector {
    attributeType?: "string" | "big" | "boolean" | "date";
    caption: CaptionsProvider;
    clearable: boolean;
    currentId: string | null;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    lazyLoading?: boolean = false;
    loadingType?: LoadingTypeEnum = "skeleton";
    options: OptionsProvider;
    readOnly: boolean;
    selectorType?: "context" | "database" | "static";
    status: Status = "available";
    type = "single" as const;
    validation?: string;

    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;

    constructor(props: ComboboxPreviewProps) {
        this.caption = new AssociationPreviewCaptionsProvider(new Map());
        this.clearable = props.clearable;
        this.currentId = getDatasourcePlaceholderText(props);
        this.customContentType = props.optionsSourceDatabaseCustomContentType;
        this.options = new AssociationPreviewOptionsProvider(this.caption, new Map());
        this.readOnly = props.readOnly;
        (this.caption as AssociationPreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceDatabaseCustomContent.renderer,
            customContentType: props.optionsSourceDatabaseCustomContentType
        });

        if (props.optionsSourceDatabaseCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
    }

    setValue(_: string | null): void {
        throw new Error("Method not implemented.");
    }
    updateProps(_: ComboboxContainerProps): void {
        throw new Error("Method not implemented.");
    }
}
