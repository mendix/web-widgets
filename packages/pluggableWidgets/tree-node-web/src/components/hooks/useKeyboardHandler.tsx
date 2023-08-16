import { SyntheticEvent, KeyboardEventHandler, useCallback } from "react";

// https://www.w3.org/TR/uievents-key/#key-attr-values
type KeyAttributeValue = "Enter" | " " | "Home" | "End" | "ArrowUp" | "ArrowDown" | "ArrowRight" | "ArrowLeft";

type KeyHandlerName = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Enter" | "Space" | "Home" | "End";

const keyValueToHandlerNameMap: Record<KeyAttributeValue, KeyHandlerName> = {
    Enter: "Enter",
    " ": "Space",
    Home: "Home",
    End: "End",
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight"
};

function isKeyValueToHandle(key: string): key is KeyAttributeValue {
    return Object.hasOwn(keyValueToHandlerNameMap, key);
}

function itCameFromCurrentTarget(event: SyntheticEvent): boolean {
    return event.currentTarget === event.target;
}

export type KeyHandlers = Partial<Record<KeyHandlerName, KeyboardEventHandler<HTMLElement>>>;

export type KeyboardHandlerHook = (keyHandlers: KeyHandlers) => KeyboardEventHandler<HTMLElement>;

export const useKeyboardHandler: KeyboardHandlerHook = keyHandlers => {
    return useCallback(
        event => {
            if (!itCameFromCurrentTarget(event)) {
                return;
            }
            if (isKeyValueToHandle(event.key)) {
                const handlerFn = keyHandlers[keyValueToHandlerNameMap[event.key]];

                if (!handlerFn) {
                    return;
                }
                event.stopPropagation();
                event.preventDefault();
                handlerFn(event);
            }
        },
        [keyHandlers]
    );
};
