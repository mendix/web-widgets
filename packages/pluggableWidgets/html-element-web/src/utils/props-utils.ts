import { CSSProperties, DOMAttributes, HTMLAttributes, ReactNode, SyntheticEvent, useState } from "react";
import { ObjectItem } from "mendix";
import DOMPurify, { Config } from "dompurify";

import { AttributesType, EventsType, HTMLElementContainerProps, TagNameEnum } from "../../typings/HTMLElementProps";
import { convertInlineCssToReactStyle } from "./style-utils";

export function prepareTag(tag: TagNameEnum, customTag: string): keyof JSX.IntrinsicElements {
    if (tag === "__customTag__") {
        return customTag as keyof JSX.IntrinsicElements;
    }

    return tag;
}

export function createEventResolver(
    item?: ObjectItem
): (event: EventsType) => [string, (e: SyntheticEvent<Element>) => void] {
    return event => {
        const name = event.eventName;
        const cb = (e: SyntheticEvent<Element>): void => {
            if (event.eventPreventDefault) {
                e.preventDefault();
            }
            if (event.eventStopPropagation) {
                e.stopPropagation();
            }

            const action = item ? event.eventActionRepeat?.get(item) : event.eventAction;

            if (action && action.canExecute) {
                action.execute();
            }
        };

        return [name, cb];
    };
}

export function prepareEvents<T>(
    eventResolver: (event: T) => [string, (e: SyntheticEvent<Element>) => void],
    events: T[]
): DOMAttributes<Element> {
    return Object.fromEntries(events.map(evt => eventResolver(evt)));
}

export function createAttributeResolver(item?: ObjectItem): (a: AttributesType) => [name: string, value: string] {
    return (a: AttributesType) => {
        const name = a.attributeName;
        let value;
        if (item) {
            value = (
                a.attributeValueType === "template" ? a.attributeValueTemplateRepeat : a.attributeValueExpressionRepeat
            )?.get(item).value;
        } else {
            value = (a.attributeValueType === "template" ? a.attributeValueTemplate : a.attributeValueExpression)
                ?.value;
        }

        return [name, value ?? ""];
    };
}

export function prepareAttributes<T>(
    attrResolver: (a: T) => [name: string, value: string],
    attrs: T[],
    cls: string,
    style?: CSSProperties
): HTMLAttributes<Element> {
    const result: HTMLAttributes<Element> = Object.fromEntries(
        attrs.map(a => {
            const [name, value] = attrResolver(a);

            switch (name) {
                case "style":
                    return ["style", convertInlineCssToReactStyle(value)];
                case "class":
                    return ["className", value];
                default:
                    return [name, value];
            }
        })
    );

    result.style = { ...style, ...result.style };
    result.className = `widget-html-element ${cls ?? ""} ${result.className ?? ""}`.trim();

    return result;
}

export function prepareHtml(
    props: Pick<HTMLElementContainerProps, "tagContentMode" | "tagContentHTML" | "tagContentRepeatHTML">,
    item?: ObjectItem
): string | undefined {
    if (props.tagContentMode !== "innerHTML") {
        return;
    }

    if (!item) {
        return props.tagContentHTML?.value;
    }

    return props.tagContentRepeatHTML?.get(item).value;
}

export function prepareChildren(
    props: Pick<HTMLElementContainerProps, "tagContentMode" | "tagContentContainer" | "tagContentRepeatContainer">,
    item?: ObjectItem
): ReactNode | undefined {
    if (props.tagContentMode !== "container") {
        return;
    }

    if (!item) {
        return props.tagContentContainer;
    }

    return props.tagContentRepeatContainer?.get(item);
}

const voidElements = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
    "textarea"
] as const;

export type VoidElement = (typeof voidElements)[number];

export function isVoidElement(tag: unknown): tag is VoidElement {
    return voidElements.includes(tag as VoidElement);
}

type Sanitize = (html: string) => string;

function parseSanitizationConfig(config?: string): Config {
    try {
        if (!config) {
            return {};
        }
        return JSON.parse(config);
    } catch (e) {
        console.error(e);
        throw new Error(
            'Can not parse "Configuration for HTML sanitization" value. Please check your widget configuration.'
        );
    }
}

export function createSanitize(config?: string): Sanitize {
    const configObject = parseSanitizationConfig(config);
    const purify = DOMPurify(window);
    return html => purify.sanitize(html, { ...configObject, RETURN_DOM_FRAGMENT: false, RETURN_DOM: false });
}

export function useSanitize(config?: string): ReturnType<typeof createSanitize> {
    const [sanitize] = useState(() => createSanitize(config));
    return sanitize;
}
