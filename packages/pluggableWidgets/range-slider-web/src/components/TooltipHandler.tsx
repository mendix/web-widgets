import Tooltip from "@rc-component/tooltip";
import { ReactElement, RefObject } from "react";

interface HandleTooltipProps {
    showTooltip: boolean;
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement | null>;
    visible: boolean;
    value: string | number;
    index: number;
    children: ReactElement;
}

export function HandleTooltip(props: HandleTooltipProps): ReactElement | null {
    const { showTooltip, tooltipAlwaysVisible, sliderRef, visible, value, index, children } = props;
    if (!showTooltip && !sliderRef.current) {
        return null;
    }
    return (
        <Tooltip
            getTooltipContainer={() => sliderRef.current!}
            prefixCls="rc-slider-tooltip"
            overlay={value}
            trigger={["hover", "click", "focus"]}
            visible={tooltipAlwaysVisible || visible}
            placement="top"
            mouseLeaveDelay={0}
            key={`${index}${value}`}
        >
            {children}
        </Tooltip>
    );
}
