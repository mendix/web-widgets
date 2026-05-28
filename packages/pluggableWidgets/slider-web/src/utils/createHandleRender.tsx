import { SliderProps as RcSliderProps } from "@rc-component/slider";
import RcTooltip from "@rc-component/tooltip";
import { DynamicValue } from "mendix";
import { RefObject } from "react";
import { formatNumber } from "./helpers";

import "@rc-component/tooltip/assets/bootstrap.css";

type CreateHandleRenderProps = {
    tooltip?: DynamicValue<string>;
    tooltipType: "value" | "customText";
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement | null>;
    decimalPlaces: number;
    decimalSeparator: string;
};

export function createHandleRender({
    tooltip,
    tooltipType,
    tooltipAlwaysVisible,
    sliderRef,
    decimalPlaces,
    decimalSeparator
}: CreateHandleRenderProps): RcSliderProps["handleRender"] | undefined {
    const isCustomText = tooltipType === "customText";

    const handleRender: RcSliderProps["handleRender"] = (node, props) => {
        const { dragging, index, ...restProps } = props;
        const overlay = isCustomText ? <div>{tooltip?.value ?? ""}</div> : null;

        return (
            <RcTooltip
                getTooltipContainer={() => sliderRef.current ?? document.body}
                defaultVisible
                prefixCls="rc-slider-tooltip"
                overlay={isCustomText ? overlay : formatNumber(restProps.value, decimalPlaces, decimalSeparator)}
                trigger={["hover", "click", "focus"]}
                visible={tooltipAlwaysVisible || dragging}
                placement="top"
                mouseLeaveDelay={0}
                key={index}
            >
                {node}
            </RcTooltip>
        );
    };

    return handleRender;
}
