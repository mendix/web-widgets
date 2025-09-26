import { SliderProps as RcSliderProps } from "@rc-component/slider";
import RcTooltip from "@rc-component/tooltip";
import { DynamicValue } from "mendix";
import { RefObject } from "react";

import "@rc-component/tooltip/assets/bootstrap.css";

type CreateHandleRenderProps = {
    showTooltip: boolean;
    tooltip?: DynamicValue<string>;
    tooltipType: "value" | "customText";
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement | null>;
};

export function createHandleRender({
    tooltip,
    showTooltip,
    tooltipType,
    tooltipAlwaysVisible,
    sliderRef
}: CreateHandleRenderProps): RcSliderProps["handleRender"] | undefined {
    const isCustomText = tooltipType === "customText";

    if (!showTooltip) {
        return;
    }

    const handleRender: RcSliderProps["handleRender"] = (node, props) => {
        const { dragging, index, ...restProps } = props;
        const overlay = <div>{tooltip?.value ?? ""}</div>;

        return (
            <RcTooltip
                getTooltipContainer={() => sliderRef.current ?? document.body}
                defaultVisible
                prefixCls="rc-slider-tooltip"
                overlay={isCustomText ? overlay : restProps.value}
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
