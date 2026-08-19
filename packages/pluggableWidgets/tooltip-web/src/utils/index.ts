import { Placement } from "@floating-ui/react";
import { ArrowPositionEnum, TooltipPositionEnum } from "../../typings/TooltipProps";

export const translatePosition = (
    tooltipPosition: TooltipPositionEnum,
    arrowPosition: ArrowPositionEnum
): Placement => {
    const placement = `${tooltipPosition}${arrowPosition === "none" ? "" : "-" + arrowPosition}`;
    return placement as Placement;
};
