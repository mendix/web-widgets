import { createElement, ReactElement } from "react";
import { SelectionHelperContainerProps } from "../typings/SelectionHelperProps";
import { useSelectionContextValue } from "@mendix/pluggable-widgets-commons";
import { SelectionHelperComponent } from "./components/SelectionHelperComponent";
import { Alert } from "@mendix/pluggable-widgets-commons/dist/components/web";

export function SelectionHelper(props: SelectionHelperContainerProps): ReactElement {
    const contextValue = useSelectionContextValue();

    if (contextValue.hasError) {
        return (
            <Alert bootstrapStyle="danger">
                The Selection Helper widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
            </Alert>
        );
    }

    const selection = contextValue.value;

    return (
        <SelectionHelperComponent type={props.renderStyle} status={selection.status} onClick={selection.toggle}>
            {selection.status === "all" && props.customAllSelected}
            {selection.status === "some" && props.customSomeSelected}
            {selection.status === "none" && props.customNoneSelected}
            {props.checkboxCaption.value ?? ""}
        </SelectionHelperComponent>
    );
}
