import { SliderProps as RcSliderProps } from "@rc-component/slider";
import RcTooltip from "@rc-component/tooltip";
import { DynamicValue } from "mendix";
import { RefObject } from "react";
import { ValueFormatter } from "./helpers";

import "@rc-component/tooltip/assets/bootstrap.css";

type CreateHandleRenderProps = {
    tooltip?: DynamicValue<string>;
    tooltipType: "value" | "customText";
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement | null>;
    format: ValueFormatter;
};

export function createHandleRender({
    tooltip,
    tooltipType,
    tooltipAlwaysVisible,
    sliderRef,
    format
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
                overlay={isCustomText ? overlay : format(restProps.value)}
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
