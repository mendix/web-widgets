import { createElement, RefObject } from "react";
import Tooltip from "rc-tooltip";
import { Handle, HandleProps } from "rc-slider";
import { DynamicValue } from "mendix";

interface HandleGeneratorProps extends HandleProps {
    value: number;
    dragging?: boolean;
    index: number;
}

type HandleGenerator = (props: HandleGeneratorProps) => JSX.Element | undefined;

type CreateHandleGeneratorParams = {
    showTooltip: boolean;
    tooltipLower?: DynamicValue<string>;
    tooltipUpper?: DynamicValue<string>;
    tooltipTypeLower: "value" | "customText";
    tooltipTypeUpper: "value" | "customText";
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement>;
};

export function createHandleGenerator(props: CreateHandleGeneratorParams): HandleGenerator | undefined {
    const {
        tooltipLower,
        tooltipUpper,
        showTooltip,
        tooltipTypeLower,
        tooltipTypeUpper,
        tooltipAlwaysVisible,
        sliderRef
    } = props;
    const tooltipTypeCheck = [tooltipTypeLower === "customText", tooltipTypeUpper === "customText"];
    const tooltipValue = [tooltipLower, tooltipUpper];

    if (!showTooltip) {
        return;
    }

    return function handleGenerator(generatorProps: HandleGeneratorProps): JSX.Element | undefined {
        const { dragging, index, ...restProps } = generatorProps;
        const isCustomText = tooltipTypeCheck[index];

        if (!sliderRef.current) {
            return;
        }

        return (
            <Tooltip
                getTooltipContainer={() => sliderRef.current!}
                prefixCls="rc-slider-tooltip"
                overlay={isCustomText ? <div>{tooltipValue[index]?.value ?? ""}</div> : restProps.value}
                trigger={["hover", "click", "focus"]}
                visible={tooltipAlwaysVisible || dragging}
                placement="top"
                mouseLeaveDelay={0}
                key={index}
            >
                <Handle {...restProps} />
            </Tooltip>
        );
    };
}
