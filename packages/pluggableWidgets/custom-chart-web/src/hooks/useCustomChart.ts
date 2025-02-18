import { PlaygroundData } from "@mendix/shared-charts/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { CSSProperties, Ref, RefCallback, useEffect, useRef } from "react";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { mergePlaygroundState } from "../utils/mergePlaygroundState";
import { usePlaygroundData } from "./usePlaygroundData";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { CustomChartControllerHost } from "src/controllers/CustomChartControllerHost";
import { mergeRefs } from "src/utils/mergeRefs";

interface UseCustomChartReturn {
    containerStyle: CSSProperties;
    playgroundData: PlaygroundData;
    ref: Ref<HTMLDivElement> | RefCallback<HTMLDivElement> | undefined;
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
    const playgroundOn = !!props.playground;

    const chartRef = useRef<HTMLDivElement>(null);
    const host = useSetup(() => new CustomChartControllerHost(props));
    const chartController = host.chartCtrl;
    const resizeController = host.resizeCtrl;
    const playgroundData = usePlaygroundData({
        data: chartController.getData(),
        layout: chartController.getLayout(),
        config: chartController.getConfig(),
        playgroundOn
    });

    useEffect(() => {
        if (props.eventDataAttribute?.value && props.onClick) {
            executeAction(props.onClick);
            props.eventDataAttribute.setValue("");
        }
    }, [props.eventDataAttribute?.value]);

    useEffect(() => {
        if (!chartRef.current || !resizeController.width) {
            return;
        }

        const onClick = (data: any): void => {
            if (props.eventDataAttribute) {
                props.eventDataAttribute?.setValue(JSON.stringify(data.points[0].bbox));
            } else {
                executeAction(props.onClick);
            }
        };
        const chartData = chartController.getChartData(onClick, resizeController);

        const playgroundProps =
            playgroundOn === false ? chartData : mergePlaygroundState(chartData, playgroundData.store.state);

        chartController.setChart(chartRef.current, playgroundProps);
    }, [
        chartController,
        playgroundData.store.state,
        playgroundOn,
        props.eventDataAttribute,
        props.onClick,
        resizeController,
        resizeController.width
    ]);

    return {
        containerStyle: {
            width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`,
            height: props.heightUnit === "percentageOfParent" ? `${props.height}%` : undefined
        },
        playgroundData,
        ref: mergeRefs<HTMLDivElement>(chartRef, host.resizeCtrl.setTarget)
    };
}
