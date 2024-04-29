import { SingleSelector, Status, CaptionsProvider } from "src/helpers/types";
import { getDatasourcePlaceholderText } from "src/helpers/utils";
import {
    StaticDataSourceCustomContentTypeEnum,
    ComboboxPreviewProps,
    OptionsSourceStaticDataSourcePreviewType,
    ComboboxContainerProps
} from "typings/ComboboxProps";
import { StaticPreviewCaptionsProvider } from "./StaticPreviewCaptionsProvider";
import { StaticPreviewOptionsProvider } from "./StaticPreviewOptionsProvider";

export class StaticPreviewSelector implements SingleSelector {
    type = "single" as const;
    status: Status = "available";
    readOnly: boolean = false;
    validation?: string | undefined = undefined;
    options: StaticPreviewOptionsProvider;
    caption: CaptionsProvider;
    clearable: boolean;
    currentId: string | null;
    customContentType: StaticDataSourceCustomContentTypeEnum = "listItem";
    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;
    constructor(props: ComboboxPreviewProps) {
        const optionsMap = new Map<string, OptionsSourceStaticDataSourcePreviewType>();
        this.caption = new StaticPreviewCaptionsProvider(
            optionsMap,
            props.staticDataSourceCustomContentType,
            getDatasourcePlaceholderText(props)
        );
        this.options = new StaticPreviewOptionsProvider(optionsMap);
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentId = null;
        this.customContentType = props.optionsSourceAssociationCustomContentType;
        if (props.optionsSourceAssociationCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
        props.optionsSourceStaticDataSource.forEach((option, index) => {
            optionsMap.set(index.toString(), option);
        });
    }
    setValue(_: string | null): void {
        throw new Error("Method not implemented.");
    }
    updateProps(_: ComboboxContainerProps): void {
        throw new Error("Method not implemented.");
    }
}
