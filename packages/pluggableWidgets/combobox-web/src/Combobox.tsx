import { createElement, ReactElement } from "react";
import { useActionEvents } from "./hooks/useActionEvents";
import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { MultiSelection } from "./components/MultiSelection/MultiSelection";

import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    const actionEvents = useActionEvents(props);

    return (
        <div className="widget-combobox" {...actionEvents}>
            {props.attributeAssociation?.type === "ReferenceSet" ? (
                <MultiSelection {...props} />
            ) : (
                <SingleSelection {...props} />
            )}
        </div>
    );
}
