import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import Quill from "quill";
import { FocusEvent, useMemo, useRef } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

type UseActionEventsReturnValue = {
    onFocus: (e: FocusEvent) => void;
    onBlur: (e: FocusEvent) => void;
};

interface useActionEventsProps
    extends Pick<RichTextContainerProps, "onFocus" | "onBlur" | "onChange" | "onChangeType"> {
    quill?: Quill | null;
}

function isInternalTarget(
    currentTarget: EventTarget & Element,
    relatedTarget: (EventTarget & Element) | null
): boolean | undefined {
    return (
        currentTarget?.contains(relatedTarget) ||
        currentTarget?.ownerDocument.querySelector(".widget-rich-text-modal-body")?.contains(relatedTarget)
    );
}

export function useActionEvents(props: useActionEventsProps): UseActionEventsReturnValue {
    const editorValueRef = useRef<string>("");
    return useMemo(() => {
        return {
            onFocus: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!isInternalTarget(currentTarget, relatedTarget)) {
                    executeAction(props.onFocus);
                    editorValueRef.current = props.quill?.getText() || "";
                }
            },
            onBlur: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!isInternalTarget(currentTarget, relatedTarget)) {
                    executeAction(props.onBlur);
                    if (props.onChangeType === "onLeave") {
                        if (props.quill) {
                            // validate if the text really changed
                            const currentText = props.quill.getText();
                            if (currentText !== editorValueRef.current) {
                                executeAction(props.onChange);
                                editorValueRef.current = currentText;
                            }
                        } else {
                            executeAction(props.onChange);
                        }
                    }
                }
            }
        };
    }, [props.onFocus, props.quill, props.onBlur, props.onChangeType, props.onChange]);
}
