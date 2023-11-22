import { createElement, ReactElement } from "react";
import { useActionEvents } from "./hooks/useActionEvents";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { MultiSelection } from "./components/MultiSelection/MultiSelection";

import "./ui/Combobox.scss";
import { useGetSelector } from "./hooks/useGetSelector";
import { Placeholder } from "./components/Placeholder";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const actionEvents = useActionEvents(props);
    const selector = useGetSelector(props);
    const commonProps = {
        tabIndex: props.tabIndex!,
        inputId: props.id,
        labelId: `${props.id}-label`,
        noOptionsText: props.noOptionsText?.value,
        a11yConfig: {
            ariaLabels: {
                clearSelection: props.clearButtonAriaLabel?.value as string,
                removeSelection: props.removeValueAriaLabel?.value as string
            },
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue?.value as string,
                a11yOptionsAvailable: props.a11yOptionsAvailable?.value as string,
                a11yInstructions: props.a11yInstructions?.value as string,
                a11yNoOption: props.noOptionsText?.value as string
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
