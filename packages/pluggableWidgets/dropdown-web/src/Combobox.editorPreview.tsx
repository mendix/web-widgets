import { createElement, ReactElement } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { ComboboxPreview } from "./components/ComboboxPreview";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    return (
        <ComboboxPreview
            emptyOptionText={props.emptyOptionText}
            clearable={props.clearable}
            readOnly={props.readOnly}
            ariaRequired={props.ariaRequired}
            filterType="contains"
        />
    );
};
