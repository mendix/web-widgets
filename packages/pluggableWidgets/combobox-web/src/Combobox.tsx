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
                clearSelection: props.clearButtonAriaLabel,
                removeSelection: props.removeValueAriaLabel
            },
            a11yStatusMessage: {
                i18nSelectedItemSingular: props.i18nSelectedItemSingular,
                i18nSelectedItemPlural: props.i18nSelectedItemPlural,
                i18nNoResults: props.i18nNoResults,
                i18nResultSingle: props.i18nResultSingle,
                i18nResultPlural: props.i18nResultPlural,
                i18nInstructions: props.i18nInstructions
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
