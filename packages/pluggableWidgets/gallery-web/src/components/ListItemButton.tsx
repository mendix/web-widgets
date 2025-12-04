import classNames from "classnames";
import { JSX, KeyboardEvent, KeyboardEventHandler, ReactElement } from "react";

export function ListItemButton(props: Omit<JSX.IntrinsicElements["div"], "ref">): ReactElement {
    return (
        <div
            {...props}
            {...kbdHandlers}
            className={classNames("widget-gallery-item-button", props.className)}
            role="button"
        />
    );
}

type KeyboardHandlers = {
    onKeyDown: KeyboardEventHandler;
    onKeyUp: KeyboardEventHandler;
};

function keyboardHandlers(): KeyboardHandlers {
    let pressed = false;
    return {
        onKeyDown: event => {
            if (isTriggerKey(event) && !isInputElement(event)) {
                preventAndStop(event);
                if (isOwn(event)) {
                    pressed = true;
                }
            }
        },
        onKeyUp: event => {
            if (isTriggerKey(event) && isOwn(event) && pressed && !isInputElement(event)) {
                preventAndStop(event);
                event.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                pressed = false;
            }
        }
    };
}

const kbdHandlers = keyboardHandlers();

function isTriggerKey(event: KeyboardEvent): boolean {
    return event.code === "Enter" || event.code === "Space";
}

function isOwn(event: KeyboardEvent): boolean {
    return event.currentTarget === event.target;
}

function isInputElement(event: KeyboardEvent): boolean {
    return event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
}

function preventAndStop(event: { stopPropagation(): void; preventDefault(): void }): void {
    event.stopPropagation();
    event.preventDefault();
}
