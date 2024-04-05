import classNames from "classnames";
import { createElement, ReactElement } from "react";

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
    onKeyDown: React.KeyboardEventHandler;
    onKeyUp: React.KeyboardEventHandler;
};

function keyboardHandlers(): KeyboardHandlers {
    let pressed = false;
    return {
        onKeyDown: event => {
            if (isTriggerKey(event)) {
                preventAndStop(event);
                if (isOwn(event)) {
                    pressed = true;
                }
            }
        },
        onKeyUp: event => {
            if (isTriggerKey(event) && isOwn(event) && pressed) {
                preventAndStop(event);
                event.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                pressed = false;
            }
        }
    };
}

const kbdHandlers = keyboardHandlers();

function isTriggerKey(event: React.KeyboardEvent): boolean {
    return event.code === "Enter" || event.code === "Space";
}

function isOwn(event: React.KeyboardEvent): boolean {
    return event.currentTarget === event.target;
}

function preventAndStop(event: { stopPropagation(): void; preventDefault(): void }): void {
    event.stopPropagation();
    event.preventDefault();
}
