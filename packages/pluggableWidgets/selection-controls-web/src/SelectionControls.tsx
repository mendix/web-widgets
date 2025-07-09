import { createElement, ReactElement } from "react";

import { SelectionControlsContainerProps } from "../typings/SelectionControlsProps";

import { MultiSelection } from "./components/MultiSelection/MultiSelection";
import { Placeholder } from "./components/Placeholder";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
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
        noOptionsText: props.noOptionsText?.value,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: props.ariaRequired,
        a11yConfig: {
            // ariaLabels: {
            //     clearSelection: props.clearButtonAriaLabel?.value ?? "",
            //     removeSelection: props.removeValueAriaLabel?.value ?? "",
            //     selectAll: props.selectAllButtonCaption?.value ?? ""
            // },
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue?.value ?? "",
                a11yOptionsAvailable: props.a11yOptionsAvailable?.value ?? "",
                a11yInstructions: props.a11yInstructions?.value ?? "",
                a11yNoOption: props.noOptionsText?.value ?? ""
            }
        }
    };

    return (
        <div className="widget-combobox" {...actionEvents}>
            {selector.status === "unavailable" ? (
                <Placeholder />
            ) : selector.type === "single" ? (
                <SingleSelection selector={selector} {...commonProps} />
            ) : (
                <MultiSelection selector={selector} {...commonProps} />
            )}
        </div>
    );
}
