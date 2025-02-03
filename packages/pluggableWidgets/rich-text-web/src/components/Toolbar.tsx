import classNames from "classnames";
import Quill from "quill";
import { CSSProperties, ReactElement, RefObject, createElement, forwardRef } from "react";
import { PresetEnum } from "typings/RichTextProps";
import { FormatsContainer, ToolbarContext, presetToNumberConverter } from "./CustomToolbars/ToolbarWrapper";
import { TOOLBAR_MAPPING, toolbarContentType } from "./CustomToolbars/constants";

export interface ToolbarProps {
    id: string;
    preset: PresetEnum;
    style?: CSSProperties;
    quill?: Quill | null;
    toolbarContent: toolbarContentType[];
}

const ToolbarKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (document.activeElement?.parentElement?.classList.contains("ql-formats")) {
        e.preventDefault();
        if (e.key === "Tab") {
            let nextFocusElementParent = document.activeElement.parentElement?.nextElementSibling as HTMLElement;
            if (e.shiftKey) {
                nextFocusElementParent = document.activeElement.parentElement?.previousElementSibling as HTMLElement;
            }
            if (nextFocusElementParent) {
                const nextElement = nextFocusElementParent.firstChild as HTMLElement;
                if (nextElement) {
                    nextElement.focus();
                    e.stopPropagation();
                }
            }
        } else if (e.key === "ArrowRight") {
            const nextElementSibling = document.activeElement.nextElementSibling as HTMLElement;
            if (nextElementSibling) {
                nextElementSibling.focus();
                e.stopPropagation();
            }
        } else if (e.key === "ArrowLeft") {
            const previousElementSibling = document.activeElement.previousElementSibling as HTMLElement;
            if (previousElementSibling) {
                previousElementSibling.focus();
                e.stopPropagation();
            }
        } else if (e.key === "Enter") {
            (document.activeElement as HTMLElement).click();
        }
    }
};

const Toolbar = forwardRef((props: ToolbarProps, ref: RefObject<HTMLDivElement>): ReactElement => {
    const { id, preset, style, quill, toolbarContent } = props;
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
            </div>
        </ToolbarContext.Provider>
    );
});

export default Toolbar;
