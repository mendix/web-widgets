import { createElement, Ref, RefObject } from "react";
import Tooltip from "rc-tooltip";
import { Handle, HandleProps } from "rc-slider";
import { DynamicValue } from "mendix";

interface HandleGeneratorProps extends HandleProps {
    prefixCls?: string;
    value: number;
    dragging?: boolean;
    index: number;
    ref?: Ref<any>;
}

type HandleGenerator = (props: HandleGeneratorProps) => JSX.Element | undefined;

type CreateHandleGeneratorParams = {
    showTooltip: boolean;
    tooltip?: DynamicValue<string>;
    tooltipType: "value" | "customText";
    tooltipAlwaysVisible: boolean;
    sliderRef: RefObject<HTMLDivElement>;
};

export function createHandleGenerator(props: CreateHandleGeneratorParams): HandleGenerator | undefined {
    const { tooltip, showTooltip, tooltipType, tooltipAlwaysVisible, sliderRef } = props;
    const isCustomText = tooltipType === "customText";

    if (!showTooltip) {
        return;
    }

    return function handleGenerator(generatorProps: HandleGeneratorProps): JSX.Element | undefined {
        const { dragging, index, ...restProps } = generatorProps;
        const overlay = <div>{tooltip?.value ?? ""}</div>;

        return (
            <Tooltip
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
                <Handle {...restProps} />
            </Tooltip>
        );
    };
}
