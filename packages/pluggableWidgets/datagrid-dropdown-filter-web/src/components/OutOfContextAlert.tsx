import { Alert } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { createElement, ReactElement } from "react";

export function OutOfContextAlert(): ReactElement {
    return (
        <Alert bootstrapStyle="danger">
            The Drop-down filter widget must be placed inside the header of the Gallery, Data grid 2.0 or Data grid 2.0
            column.
        </Alert>
    );
}
