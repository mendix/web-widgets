import { ComboboxPreviewProps } from "../../../typings/ComboboxProps";
import { SingleSelector } from "../types";
import { getDatasourcePlaceholderText } from "../utils";
import { DatasourcePreviewCaptionsProvider, PreviewContentRenderer } from "./DatasourcePreviewCaptionsProvider";
import { PreviewOptionsProvider } from "./PreviewOptionsProvider";

/** The editor preview of an association or database combo box: the datasource caption as the value. */
export class DatasourcePreviewSelector implements SingleSelector {
    readonly type = "single";
    readonly status = "available";
    readonly validation = undefined;
    readonly readOnly: boolean;
    readonly clearable: boolean;
    readonly currentId: string;
    readonly options = new PreviewOptionsProvider([]);
    readonly caption: DatasourcePreviewCaptionsProvider;

    constructor(props: ComboboxPreviewProps) {
        const database = props.source === "database";
        const content = database
            ? props.optionsSourceDatabaseCustomContent
            : props.optionsSourceAssociationCustomContent;
        const contentType = database
            ? props.optionsSourceDatabaseCustomContentType
            : props.optionsSourceAssociationCustomContentType;
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentId = getDatasourcePlaceholderText(props);
        this.caption = new DatasourcePreviewCaptionsProvider(content.renderer as PreviewContentRenderer, contentType);
    }

    setValue(): void {}
}
