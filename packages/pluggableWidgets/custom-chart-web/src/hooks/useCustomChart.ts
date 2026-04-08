import { computed } from "mobx";
import { CSSProperties, Ref, RefCallback, useEffect } from "react";
import { CustomChartControllerHost } from "src/controllers/CustomChartControllerHost";
import { mergeRefs } from "src/utils/mergeRefs";
import { PlaygroundData } from "@mendix/shared-charts/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { ControllerProps } from "../controllers/typings";

// TODO: replace with get-dimensions from widget-plugin-platform
function getContainerStyle(
    width: number,
    widthUnit: CustomChartContainerProps["widthUnit"],
    height: number,
    heightUnit: CustomChartContainerProps["heightUnit"]
): CSSProperties {
    const style: CSSProperties = {
        width: widthUnit === "percentage" ? `${width}%` : `${width}px`
    };

    if (heightUnit === "percentageOfWidth") {
        style.paddingBottom = widthUnit === "percentage" ? `${height}%` : `${width / 2}px`;
    } else if (heightUnit === "pixels") {
        style.height = `${height}px`;
    } else if (heightUnit === "percentageOfParent") {
        style.height = `${height}%`;
    }

    return style;
}

interface UseCustomChartReturn {
    containerStyle: CSSProperties;
    playgroundData: PlaygroundData;
    ref: Ref<HTMLDivElement> | RefCallback<HTMLDivElement> | undefined;
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
    const gateProvider = useConst(() => new GateProvider<ControllerProps>(props));

    const {
        store,
        chartViewModel,
        resizeCtrl: resizeController
    } = useSetup(() => new CustomChartControllerHost(gateProvider.gate));

    useEffect(() => {
        gateProvider.setProps(props);
    });

    const containerStyle = getContainerStyle(props.width, props.widthUnit, props.height, props.heightUnit);
    const playgroundData = computed(
        (): PlaygroundData => ({
            type: "editor.data.v2",
            store,
            plotData: store.data,
            layoutOptions: {},
            configOptions: {}
        })
    ).get();

    return {
        containerStyle,
        playgroundData,
        ref: mergeRefs<HTMLDivElement>(resizeController.setTarget, chartViewModel.setChart)
    };
}
