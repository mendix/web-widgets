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
        labelId: `${props.id}-label`
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
