import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { createElement, ReactElement } from "react";
import { BadgeButton } from "./components/BadgeButton";
import { BadgeButtonPreviewProps } from "../typings/BadgeButtonProps";

export const preview = (props: BadgeButtonPreviewProps): ReactElement => {
    const { className, style, label, value } = props;

    return <BadgeButton className={className} label={label} style={parseStyle(style)} value={value} />;
};
