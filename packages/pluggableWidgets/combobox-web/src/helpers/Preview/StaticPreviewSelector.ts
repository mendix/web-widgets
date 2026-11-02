import { ComboboxPreviewProps } from "../../../typings/ComboboxProps";
import { SingleSelector } from "../types";
import { getDatasourcePlaceholderText } from "../utils";
import { PreviewOptionsProvider } from "./PreviewOptionsProvider";
import { StaticPreviewCaptionsProvider } from "./StaticPreviewCaptionsProvider";

/** The editor preview of a static combo box: the configured entries as options. */
export class StaticPreviewSelector implements SingleSelector {
    readonly type = "single";
    readonly status = "available";
    readonly validation = undefined;
    readonly currentId = null;
    readonly readOnly: boolean;
    readonly clearable: boolean;
    readonly options: PreviewOptionsProvider;
    readonly caption: StaticPreviewCaptionsProvider;

    constructor(props: ComboboxPreviewProps) {
        const entries = props.optionsSourceStaticDataSource;
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.options = new PreviewOptionsProvider(entries.map((_, index) => index.toString()));
        this.caption = new StaticPreviewCaptionsProvider(
            entries,
            props.staticDataSourceCustomContentType,
            getDatasourcePlaceholderText(props)
        );
    }

    setValue(): void {}
}
