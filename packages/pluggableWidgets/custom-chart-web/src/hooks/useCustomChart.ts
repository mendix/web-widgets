import { Ref, RefCallback, useEffect } from "react";
import { PlaygroundData } from "@mendix/shared-charts/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { CustomChartControllerHost } from "../controllers/CustomChartControllerHost";
import { ControllerProps } from "../controllers/typings";
import { mergeRefs } from "../utils/mergeRefs";

interface UseCustomChartReturn {
    playgroundData: PlaygroundData;
    ref: Ref<HTMLDivElement> | RefCallback<HTMLDivElement> | undefined;
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
    const gateProvider = useConst(() => new GateProvider<ControllerProps>(props));

    const {
        store,
        adapter,
        chartViewModel,
        resizeCtrl: resizeController
    } = useSetup(() => new CustomChartControllerHost(gateProvider.gate));

    useEffect(() => {
        gateProvider.setProps(props);
    });

    const playgroundData: PlaygroundData = {
        type: "editor.data.v2",
        store,
        plotData: store.data,
        layoutOptions: adapter.layout,
        configOptions: adapter.config
    };

    return {
        playgroundData,
        ref: mergeRefs<HTMLDivElement>(resizeController.setTarget, chartViewModel.setChart)
    };
}
