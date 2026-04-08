import { autorun } from "mobx";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { PlotlyChartProps, PlotlyChart } from "../components/PlotlyChart";

export class PlotlyController {
    private cleanup: undefined | (() => void) = undefined;

    constructor(private props: ComputedAtom<PlotlyChartProps>) {}

    setChart = (target: HTMLDivElement | null): void => {
        if (target === null) {
            this.cleanup?.();
        } else {
            const chart = new PlotlyChart(target, this.props.get());

            const dispose = autorun(
                () => {
                    chart.update(this.props.get());
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
