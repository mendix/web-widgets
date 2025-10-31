import { autorun } from "mobx";
import { ChartProps, PlotlyChart } from "../components/PlotlyChart";

interface PropsProvider {
    mergedProps: ChartProps;
}

interface PlotlyControllerSpec {
    propsProvider: PropsProvider;
}

export class PlotlyController {
    private cleanup: undefined | (() => void) = undefined;
    private propsProvider: PropsProvider;

    constructor(spec: PlotlyControllerSpec) {
        this.propsProvider = spec.propsProvider;
    }

    setChart = (target: HTMLDivElement | null): void => {
        if (target === null) {
            this.cleanup?.();
        } else {
            const chart = new PlotlyChart(target, this.propsProvider.mergedProps);

            const dispose = autorun(
                () => {
                    chart.update(this.propsProvider.mergedProps);
                },
                { delay: 100 }
            );

            this.cleanup = () => {
                dispose();
                chart.destroy();
            };
        }
    };
}
