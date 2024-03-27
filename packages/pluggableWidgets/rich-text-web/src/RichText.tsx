import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import BundledEditor from "./components/Editor";
import "./ui/RichText.scss";
import { createMenubar } from "./utils/menubar";
import { createPreset } from "./utils/presets";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const { stringAttribute, id, width: w, height: h, widthUnit, heightUnit, preset, menubarMode } = props;

    if (stringAttribute.status === "loading") {
        return <div></div>;
    }

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });

    const presets = createPreset(preset, props);
    const menubar = createMenubar(menubarMode, props);
    return (
        <div
            id={id}
            className={classNames("widget-rich-text", `${stringAttribute.readOnly ? `editor-richtext` : ""}`)}
            style={{ width, height }}
        >
            <BundledEditor
                {...props}
                menubar={menubar}
                toolbar={presets.toolbar}
                key={`${String(stringAttribute.readOnly)}_${id}`}
            />
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </div>
    );
}
