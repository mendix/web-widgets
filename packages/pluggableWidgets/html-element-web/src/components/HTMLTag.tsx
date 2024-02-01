import { createElement, HTMLAttributes, ReactElement, ReactNode } from "react";
import { useSanitize } from "../utils/props-utils";

interface HTMLTagProps {
    tagName: keyof JSX.IntrinsicElements;
    unsafeHTML?: string;
    children: ReactNode;
    attributes: HTMLAttributes<Element> & { [dataAttribute: `data-${string}`]: string };
    sanitizationConfig?: string;
}

export function HTMLTag(props: HTMLTagProps): ReactElement {
    const sanitize = useSanitize(props.sanitizationConfig);
    const Tag = props.tagName;
    const { unsafeHTML } = props;
    if (unsafeHTML !== undefined) {
        return <Tag {...props.attributes} dangerouslySetInnerHTML={{ __html: sanitize(unsafeHTML) }} />;
    }

    return <Tag {...props.attributes}>{props.children}</Tag>;
}
