import { createElement, ReactElement } from "react";

import { CheckboxRadioSelectionContainerProps } from "../typings/CheckboxRadioSelectionProps";

import { CheckboxSelection } from "./components/CheckboxSelection/CheckboxSelection";
import { Placeholder } from "./components/Placeholder";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { SelectionBaseProps } from "./helpers/types";
import { useGetSelector } from "./hooks/useGetSelector";

import "./ui/CheckboxRadioSelection.scss";

export default function CheckboxRadioSelection(props: CheckboxRadioSelectionContainerProps): ReactElement {
    const selector = useGetSelector(props);
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: props.tabIndex!,
        inputId: props.id,
        labelId: `${props.id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: props.ariaRequired,
        groupName: props.groupName,
        noOptionsText: props.noOptionsText?.value ?? "No options available"
    };

    return (
        <div className={`widget-checkbox-radio-selection`}>
            {selector.status === "unavailable" ? (
                <Placeholder noOptionsText={commonProps.noOptionsText} />
            ) : selector.type === "single" ? (
                <RadioSelection selector={selector} {...commonProps} />
            ) : (
                <CheckboxSelection selector={selector} {...commonProps} />
            )}
        </div>
    );
}
