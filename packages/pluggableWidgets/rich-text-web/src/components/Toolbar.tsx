import classNames from "classnames";
import Quill from "quill";
import { CSSProperties, ReactElement, RefObject, createElement, forwardRef } from "react";
import { CustomFontsType, PresetEnum } from "../../typings/RichTextProps";
import { formatCustomFonts } from "../utils/formats/fonts";
import { FormatsContainer, ToolbarContext, presetToNumberConverter } from "./CustomToolbars/ToolbarWrapper";
import { TOOLBAR_MAPPING, toolbarContentType } from "./CustomToolbars/constants";

export interface ToolbarProps {
    customFonts?: CustomFontsType[];
    id: string;
    preset: PresetEnum;
    quill?: Quill | null;
    style?: CSSProperties;
    toolbarContent: toolbarContentType[];
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
                                let value = currentToolbar.value;

                                if (currentToolbar.title === "Font type") {
                                    type FontListType = Array<{ value: string; description: string; style: string }>;
                                    value = [
                                        ...(currentToolbar.value as FontListType),
                                        ...formatCustomFonts(props.customFonts ?? [])
                                    ].sort((a, b) => (a.value ?? "").localeCompare(b.value ?? ""));
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
                                              value,
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
