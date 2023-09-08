import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { ReactElement, createElement } from "react";

export function ErrorBox<T extends Error>(props: { error: T }): ReactElement {
    return <Alert bootstrapStyle="danger">Error: {props.error.message}</Alert>;
}
