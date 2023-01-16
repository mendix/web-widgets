import { Alert } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { ReactElement, createElement } from "react";

export function ErrorBox<T extends Error>(props: { error: T }): ReactElement {
    return <Alert bootstrapStyle="danger">Error: {props.error.message}</Alert>;
}
