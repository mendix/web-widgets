import { createElement, ReactElement } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { DropdownPreview } from "./components/DropdownPreview";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    return (
        <DropdownPreview
            emptyOptionText={props.emptyOptionText}
            clearable={props.clearable}
            readOnly={props.readOnly}
            ariaRequired={props.ariaRequired}
            filterType="contains"
        />
    );
};
