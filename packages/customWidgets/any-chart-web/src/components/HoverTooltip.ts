import { FunctionComponent, createElement } from "react";

export const HoverTooltip: FunctionComponent<{ text?: string | number }> = ({ text }) =>
    text ? createElement("div", {}, text) : null;

HoverTooltip.displayName = "HoverTooltip";
