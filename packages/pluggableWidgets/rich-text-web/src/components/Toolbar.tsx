import classNames from "classnames";
import Quill from "quill";
import { CSSProperties, ReactElement, ReactNode, RefObject, createElement, forwardRef } from "react";
import { PresetEnum } from "typings/RichTextProps";
import { FormatsContainer, ToolbarContext, presetToNumberConverter } from "./CustomToolbars/ToolbarWrapper";
import { TOOLBAR_MAPPING, toolbarContentType } from "./CustomToolbars/constants";

export interface ToolbarProps {
    id: string;
    preset: PresetEnum;
    style?: CSSProperties;
    quill?: Quill | null;
    toolbarContent: toolbarContentType[];
    customHandlers?: Record<string, () => void>;
    children?: ReactNode;
}

const ToolbarKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    const activeElement = document.activeElement as HTMLElement;
    const parentElement = activeElement?.parentElement;
    if (!parentElement?.classList.contains("ql-formats")) {
        return;
    }
    e.preventDefault();
    if (e.key === "Tab") {
        const nextFocusElementParent = e.shiftKey
            ? (parentElement.previousElementSibling as HTMLElement)
            : (parentElement.nextElementSibling as HTMLElement);
        if (nextFocusElementParent) {
            const nextElement = nextFocusElementParent.firstChild as HTMLElement;
            if (nextElement) {
                nextElement.focus();
                e.stopPropagation();
            }
        }
    } else if (e.key === "ArrowRight") {
        const nextElementSibling = activeElement.nextElementSibling as HTMLElement;
        if (nextElementSibling) {
            nextElementSibling.focus();
            e.stopPropagation();
        }
    } else if (e.key === "ArrowLeft") {
        const previousElementSibling = activeElement.previousElementSibling as HTMLElement;
        if (previousElementSibling) {
            previousElementSibling.focus();
            e.stopPropagation();
        }
    } else if (e.key === "Enter") {
        activeElement.click();
    }
};

const Toolbar = forwardRef((props: ToolbarProps, ref: RefObject<HTMLDivElement>): ReactElement => {
    const { id, preset, style, quill, toolbarContent, customHandlers, children } = props;
    const presetValue = presetToNumberConverter(preset);

    return (
        <ToolbarContext.Provider
            value={{
                presetValue
            }}
        >
            <div id={id} style={style} ref={ref} className="widget-rich-text-toolbar" onKeyDown={ToolbarKeyDownHandler}>
                {toolbarContent.map((toolbarGroup, index) => {
                    return (
                        <FormatsContainer presetValue={toolbarGroup.presetValue} key={`toolbargroup_${id}_${index}`}>
                            {toolbarGroup.children.map((toolbar, idx) => {
                                const currentToolbar = TOOLBAR_MAPPING[toolbar];
                                const key = `toolbar_${id}_${index}_${idx}`;

                                // Create a wrapped button for custom handlers
                                if (customHandlers && customHandlers[toolbar]) {
                                    if (toolbar === "fullscreen") {
                                        return (
                                            <button
                                                key={key}
                                                className="fullscreen-button"
                                                title={currentToolbar.title}
                                                onClick={customHandlers[toolbar]}
                                                tabIndex={-1}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="18"
                                                    height="18"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                                </svg>
                                            </button>
                                        );
                                    }
                                }

                                return currentToolbar.custom
                                    ? createElement(currentToolbar.component, {
                                          key,
                                          quill,
                                          title: currentToolbar.title
                                      })
                                    : createElement(
                                          currentToolbar.component,
                                          {
                                              key,
                                              className: classNames(currentToolbar.className),
                                              presetValue: currentToolbar.presetValue,
                                              value: currentToolbar.value,
                                              title: currentToolbar.title
                                          },
                                          currentToolbar.children && createElement(currentToolbar.children)
                                      );
                            })}
                        </FormatsContainer>
                    );
                })}
                {children && <div className="ql-formats custom-formats">{children}</div>}
            </div>
        </ToolbarContext.Provider>
    );
});

export default Toolbar;
