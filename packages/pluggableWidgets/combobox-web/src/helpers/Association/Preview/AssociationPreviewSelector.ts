import { SingleSelector } from "src/helpers/types";
import { getDatasourcePlaceholderText } from "src/helpers/utils";
import { ComboboxPreviewProps } from "typings/ComboboxProps";
import { BaseAssociationSelector } from "../BaseAssociationSelector";
import { ReferenceValue } from "mendix";
import { AssociationPreviewCaptionsProvider } from "./AssociationPreviewCaptionsProvider";
import { AssociationPreviewOptionsProvider } from "./AssociationPreviewOptionsProvider";

export class AssociationPreviewSelector
    extends BaseAssociationSelector<string, ReferenceValue>
    implements SingleSelector
{
    type = "single" as const;

    constructor(props: ComboboxPreviewProps) {
        super();
        this.caption = new AssociationPreviewCaptionsProvider(new Map());
        this.options = new AssociationPreviewOptionsProvider(this.caption, new Map());
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentId = getDatasourcePlaceholderText(props);
        this.customContentType = props.optionsSourceAssociationCustomContentType;
        (this.caption as AssociationPreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceAssociationCustomContent.renderer,
            customContentType: props.optionsSourceAssociationCustomContentType
        });

        if (props.optionsSourceAssociationCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
    }
}
