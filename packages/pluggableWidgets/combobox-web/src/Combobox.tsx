import { createElement, ReactElement } from "react";
import { useActionEvents } from "./hooks/useActionEvents";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { MultiSelection } from "./components/MultiSelection/MultiSelection";

import "./ui/Combobox.scss";
import { useGetSelector } from "./hooks/useGetSelector";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const actionEvents = useActionEvents(props);
    const selector = useGetSelector(props);

    return (
        <div className="widget-combobox" id={props.id} tabIndex={props.tabIndex} {...actionEvents}>
            {selector.type === "single" ? (
                <SingleSelection selector={selector} />
            ) : (
                <MultiSelection selector={selector} />
            )}
        </div>
    );
}
