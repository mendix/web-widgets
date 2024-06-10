import { SelectionSingleValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { BaseDatabaseSingleSelector } from "./BaseDatabaseSingleSelector";
import { extractDatabaseProps } from "./utils";

export class DatabaseSingleSelectionSelector<T extends string | Big> extends BaseDatabaseSingleSelector<T> {
    selection?: SelectionSingleValue;

    updateProps(props: ComboboxContainerProps): void {
        super.updateProps(props);

        const { captionProvider, customContent, customContentType, ds, emptyOption, lazyLoading, valueAttribute } =
            extractDatabaseProps(props);

        this.lazyLoader.setLimit(this.lazyLoader.getLimit(ds.limit, false, ds.status, lazyLoading));
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            formattingAttributeOrExpression: captionProvider,
            customContent,
            customContentType,
            attribute: valueAttribute
        });

        if (!ds || ds.status === "unavailable" || !emptyOption || emptyOption.status === "unavailable") {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }

        this.selection = props.optionsSourceDatabaseItemSelection as SelectionSingleValue;
        this.status = ds.status;
    }

    setValue(objectId: string | null): void {
        this.selection?.setSelection(this.options._optionToValue(objectId));
        super.setValue(objectId);
    }
}
