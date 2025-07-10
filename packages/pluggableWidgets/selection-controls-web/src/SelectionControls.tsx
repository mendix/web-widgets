import { createElement, ReactElement } from "react";

import { SelectionControlsContainerProps } from "../typings/SelectionControlsProps";

import { CheckboxSelection } from "./components/CheckboxSelection/CheckboxSelection";
import { Placeholder } from "./components/Placeholder";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { SelectionBaseProps } from "./helpers/types";
import { useActionEvents } from "./hooks/useActionEvents";
import { useGetSelector } from "./hooks/useGetSelector";

import "./ui/SelectionControls.scss";

export default function SelectionControls(props: SelectionControlsContainerProps): ReactElement {
    const selector = useGetSelector(props);
    const actionEvents = useActionEvents({
        onEnterEvent: props.onEnterEvent,
        onLeaveEvent: props.onLeaveEvent,
        selector
    });
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: props.tabIndex!,
        inputId: props.id,
        labelId: `${props.id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: props.ariaRequired,
        a11yConfig: {
            ariaLabels: {
                clearSelection: props.clearButtonAriaLabel?.value ?? "",
                removeSelection: props.removeValueAriaLabel?.value ?? ""
            },
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue?.value ?? "",
                a11yOptionsAvailable: props.a11yOptionsAvailable?.value ?? "",
                a11yInstructions: props.a11yInstructions?.value ?? ""
            }
        }
    };

    return (
        <div className="widget-selection-controls" {...actionEvents}>
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
