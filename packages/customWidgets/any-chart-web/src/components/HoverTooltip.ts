import { SFC, createElement } from "react";

export const HoverTooltip: SFC<{ text?: string | number }> = ({ text }) =>
    text ? createElement("div", {}, text) : null;

HoverTooltip.displayName = "HoverTooltip";
