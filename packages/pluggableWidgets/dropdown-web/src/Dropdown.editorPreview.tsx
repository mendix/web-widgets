import { createElement, ReactElement } from "react";
import { DropdownPreviewProps } from "../typings/DropdownProps";
import { DropdownPreview } from "./components/DropdownPreview";

export const preview = (props: DropdownPreviewProps): ReactElement => {
    return (
        <DropdownPreview
            emptyOptionText={props.emptyOptionText}
            clearable={props.clearable}
            ariaRequired={props.ariaRequired}
            typeahead="contains"
        />
    );
};
