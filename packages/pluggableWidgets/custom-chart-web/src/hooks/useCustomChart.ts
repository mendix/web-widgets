import { EditorStoreState, initStateFromProps, PlaygroundData, useEditorStore } from "@mendix/shared-charts/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { CSSProperties, Ref, RefCallback, useEffect } from "react";
import { CustomChartControllerHost } from "src/controllers/CustomChartControllerHost";
import { mergeRefs } from "src/utils/mergeRefs";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { ControllerProps } from "../controllers/typings";

interface UseCustomChartReturn {
    containerStyle: CSSProperties;
    playgroundData: PlaygroundData;
    ref: Ref<HTMLDivElement> | RefCallback<HTMLDivElement> | undefined;
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
    const propsGateProvider = useConst(() => new GateProvider<ControllerProps>(props));
    const editorStateGateProvider = useConst(
        () => new GateProvider<EditorStoreState>({ layout: "{}", config: "{}", data: [] })
    );
    const {
        chartPropsController,
        plotlyController,
        resizeCtrl: resizeController
    } = useSetup(
        () =>
            new CustomChartControllerHost({
                propsGate: propsGateProvider.gate,
                editorStateGate: editorStateGateProvider.gate
            })
    );

    const editorStore = useEditorStore({
        dataLength: chartPropsController.data.length,
        initState: initStateFromProps(chartPropsController.data)
    });

    useEffect(() => {
        propsGateProvider.setProps(props);
    });

    useEffect(() => {
        editorStateGateProvider.setProps(editorStore.state);
    });

    useEffect(() => {
        if (props.eventDataAttribute?.value && props.onClick) {
            executeAction(props.onClick);
            props.eventDataAttribute.setValue("");
        }
    }, [props.eventDataAttribute?.value]);

    return {
        containerStyle: {
            width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`,
            height: props.heightUnit === "percentageOfParent" ? `${props.height}%` : undefined
        },
        playgroundData: {
            store: editorStore,
            plotData: chartPropsController.data,
            layoutOptions: chartPropsController.layout,
            configOptions: chartPropsController.config
        },
        ref: mergeRefs<HTMLDivElement>(resizeController.setTarget, plotlyController.setChart)
    };
}
