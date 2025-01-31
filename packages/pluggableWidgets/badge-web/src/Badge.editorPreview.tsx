import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { createElement, ReactElement } from "react";

import { BadgePreviewProps } from "../typings/BadgeProps";
import { Badge } from "./components/Badge";

export const preview = (props: BadgePreviewProps): ReactElement => {
    const { class: className, style, type, value } = props;

    return <Badge type={type} value={value ? value : ""} className={className} style={parseStyle(style)} />;
};
