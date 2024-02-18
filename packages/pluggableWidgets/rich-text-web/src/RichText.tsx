import { createElement } from "react";
import { RichTextContainerProps } from "../typings/RichTextProps";
import BundledEditor from "./components/Editor";
import "./ui/RichText.scss";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createPreset } from "./utils/presets";

export default function RichText(props: RichTextContainerProps): JSX.Element {
    const { stringAttribute, id, width: w, height: h, widthUnit, heightUnit, preset } = props;

    if (stringAttribute.status === "loading") {
        return <div></div>;
    }

    const { width, height } = getDimensions({
        width: w,
        widthUnit,
        height: h,
        heightUnit
    });

    const presets = createPreset(preset, { toolbar: props.toolbar });

    return (
        <div
            id={id}
            className={classNames("widget-rich-text", `${stringAttribute.readOnly ? `editor-richtext` : ""}`)}
            style={{ width, height }}
        >
            <BundledEditor {...props} toolbar={presets.toolbar} />
            <ValidationAlert>{stringAttribute.validation}</ValidationAlert>
        </div>
    );
}
