import { ReactElement, createElement, CSSProperties } from "react";
import { PresetEnum } from "typings/RichTextProps";
import { If } from "@mendix/widget-plugin-component-kit/If";
export interface ToolbarProps {
    id: string;
    preset: PresetEnum;
    style?: CSSProperties;
}

function presetToNumberConverter(preset: PresetEnum): number {
    switch (preset) {
        case "custom":
            return 0;
        case "basic":
            return 1;
        case "standard":
            return 2;
        case "full":
            return 3;
        default:
            return 1;
    }
}

// TODO: font size,
// link insert with pop up? open new page or not
// alphabet bullet list?
// undo - redo
// emoji
// fullscreen ?
// insert code with pop up?
export default function Toolbar(props: ToolbarProps): ReactElement {
    const { id, preset, style } = props;
    const presetValue = presetToNumberConverter(preset);
    return (
        <div id={id} style={style}>
            <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <If condition={presetValue > 1}>
                    <button className="ql-underline"></button>
                </If>
                <If condition={presetValue > 2}>
                    <button className="ql-strike"></button>
                </If>
            </span>
            <If condition={presetValue > 2}>
                <span className="ql-formats">
                    <button className="ql-script" value="super"></button>
                    <button className="ql-script" value="sub"></button>
                </span>
            </If>
            <span className="ql-formats">
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
                <If condition={presetValue > 2}>
                    <button className="ql-list" value="check"></button>
                </If>
            </span>
            <span className="ql-formats">
                <button className="ql-indent" value="-1"></button>
                <button className="ql-indent" value="+1"></button>
                <button className="ql-link"></button>
            </span>
            <If condition={presetValue > 2}>
                <span className="ql-formats">
                    <button className="ql-image"></button>
                    <button className="ql-video"></button>
                    <button className="ql-formula"></button>
                </span>
            </If>
            <If condition={presetValue > 1}>
                <span className="ql-formats">
                    <button className="ql-blockquote"></button>
                    <button className="ql-direction" value="rtl"></button>
                    <If condition={presetValue > 2}>
                        <button className="ql-code-block" value="rtl"></button>
                    </If>
                </span>
                <span className="ql-formats">
                    <button className="ql-align"></button>
                    <select className="ql-align">
                        <option value="center"></option>
                        <option value="justify"></option>
                    </select>
                    <button className="ql-align" value="right"></button>
                </span>
                <span className="ql-formats">
                    <select className="ql-font"></select>
                    <select className="ql-color"></select>
                    <select className="ql-background"></select>
                </span>
            </If>
            <If condition={presetValue > 2}>
                <span className="ql-formats">
                    <select className="ql-header">
                        <option value="1"></option>
                        <option value="2"></option>
                        <option value="3"></option>
                        <option value="4"></option>
                        <option value="5"></option>
                        <option value="false"></option>
                    </select>
                </span>
            </If>
            <span className="ql-formats">
                <button className="ql-clean"></button>
            </span>
        </div>
    );
}
