import { EditorStoreState } from "@mendix/shared-charts/main";
import { DerivedPropsGate, ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { makeAutoObservable } from "mobx";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { ChartProps } from "../components/PlotlyChart";
import { parseConfig, parseData, parseLayout } from "../utils/utils";
import { ControllerProps } from "./typings";

interface SizeProvider {
    width: number;
    height: number;
}

interface ChartPropsControllerSpec {
    propsGate: DerivedPropsGate<ControllerProps>;
    sizeProvider: SizeProvider;
    editorStateGate: DerivedPropsGate<EditorStoreState>;
}

export class ChartPropsController implements ReactiveController {
    private cleanup: undefined | (() => void) = undefined;
    private editorStateGate: DerivedPropsGate<EditorStoreState>;
    private propsGate: DerivedPropsGate<ControllerProps>;
    private sizeProvider: SizeProvider;

    constructor(host: ReactiveControllerHost, spec: ChartPropsControllerSpec) {
        host.addController(this);

        this.editorStateGate = spec.editorStateGate;
        this.propsGate = spec.propsGate;
        this.sizeProvider = spec.sizeProvider;

        makeAutoObservable<ChartPropsController>(this, { setup: false });
    }

    private get props(): ControllerProps {
        return this.propsGate.props;
    }

    private get configurationOptions(): string {
        return this.props.configurationOptions;
    }

    private get dataAttribute(): undefined | string {
        return this.props.dataAttribute?.value;
    }

    private get dataStatic(): string {
        return this.props.dataStatic;
    }

    private get layoutAttribute(): undefined | string {
        return this.props.layoutAttribute?.value;
    }

    private get layoutStatic(): string {
        return this.props.layoutStatic;
    }

    private get sampleData(): string {
        return this.props.sampleData;
    }

    private get sampleLayout(): string {
        return this.props.sampleLayout;
    }

    setup(): () => void {
        return () => this.cleanup?.();
    }

    private get chartConfig(): ChartProps["config"] {
        return {
            displayModeBar: false,
            ...this.config
        };
    }

    private get chartLayout(): ChartProps["layout"] {
        return {
            ...this.layout,
            width: this.sizeProvider.width,
            height: this.sizeProvider.height
        };
    }

    private get chartOnClick(): (data: any) => void {
        return (data: any): void => {
            if (this.props.eventDataAttribute) {
                this.props.eventDataAttribute?.setValue(JSON.stringify(data.points[0].bbox));
            } else {
                executeAction(this.props.onClick);
            }
        };
    }

    get chartProps(): ChartProps {
        return {
            config: this.chartConfig,
            data: this.data,
            layout: this.chartLayout,
            onClick: this.chartOnClick,
            width: this.sizeProvider.width,
            height: this.sizeProvider.height
        };
    }

    get config(): Partial<Config> {
        return parseConfig(this.configurationOptions);
    }

    get data(): Data[] {
        return parseData(this.dataStatic, this.dataAttribute, this.sampleData);
    }

    get layout(): Partial<Layout> {
        return parseLayout(this.layoutStatic, this.layoutAttribute, this.sampleLayout);
    }

    get mergedProps(): ChartProps {
        const props = this.chartProps;
        const state = this.editorStateGate.props;
        return {
            ...props,
            config: {
                ...props.config,
                ...parseConfig(state.config)
            },
            layout: {
                ...props.layout,
                ...parseLayout(state.layout)
            },
            data: props.data.map((trace, index) => {
                let stateTrace: Data;
                try {
                    stateTrace = JSON.parse(state.data[index]);
                } catch {
                    console.warn(`Failed to parse data for trace(${index})`);
                    stateTrace = {};
                }
                return {
                    ...trace,
                    ...stateTrace
                } as Data;
            })
        };
    }
}
