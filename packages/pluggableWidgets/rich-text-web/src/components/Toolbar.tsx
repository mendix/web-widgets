import Quill from "quill";
import { CSSProperties, ReactElement, createElement } from "react";
import { PresetEnum } from "typings/RichTextProps";
import { FormatsContainer, ToolbarContext, presetToNumberConverter } from "./CustomToolbars/ToolbarWrapper";
import { toolbarContentType, TOOLBAR_MAPPING } from "./CustomToolbars/constants";
import classNames from "classnames";

export interface ToolbarProps {
    id: string;
    preset: PresetEnum;
    style?: CSSProperties;
    quill?: Quill | null;
    toolbarContent: toolbarContentType[];
}

// TODO: font size,
// link insert with pop up? open new page or not
// alphabet bullet list?
// undo - redo
// emojiO
// fullscreen ?
// insert code with pop up?
export default function Toolbar(props: ToolbarProps): ReactElement {
    const { id, preset, style, quill, toolbarContent } = props;
    const presetValue = presetToNumberConverter(preset);

    return (
        <ToolbarContext.Provider
            value={{
                presetValue
            }}
        >
            <div id={id} style={style}>
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
}
