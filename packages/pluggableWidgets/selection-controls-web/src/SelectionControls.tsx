import { createElement, ReactElement } from "react";

import { SelectionControlsContainerProps } from "../typings/SelectionControlsProps";

import { CheckboxSelection } from "./components/CheckboxSelection/CheckboxSelection";
import { Placeholder } from "./components/Placeholder";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { SelectionBaseProps } from "./helpers/types";
import { useGetSelector } from "./hooks/useGetSelector";

import "./ui/SelectionControls.scss";

export default function SelectionControls(props: SelectionControlsContainerProps): ReactElement {
    const selector = useGetSelector(props);
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: props.tabIndex!,
        inputId: props.id,
        labelId: `${props.id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: props.ariaRequired
    };

    return (
        <div className="widget-selection-controls">
            {selector.status === "unavailable" ? (
                <Placeholder />
            ) : selector.type === "single" ? (
                <RadioSelection selector={selector} {...commonProps} />
            ) : (
                <CheckboxSelection selector={selector} {...commonProps} />
            )}
        </div>
    );
}
