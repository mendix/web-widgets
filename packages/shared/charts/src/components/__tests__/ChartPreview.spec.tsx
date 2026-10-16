import { render } from "@testing-library/react";
import { ChartPreview, ChartPreviewProps } from "../ChartPreview";

function renderChart(props: Partial<ChartPreviewProps> = {}): HTMLElement {
    const { container } = render(
        <ChartPreview
            class="chart-under-test"
            showLegend={false}
            playground={{ widgetCount: 0, renderer: () => null }}
            widthUnit="percentage"
            width={100}
            heightUnit="percentageOfWidth"
            height={75}
            image={<ChartPreview.PlotImage src="plot.svg" alt="Plot" />}
            legend={<ChartPreview.PlotLegend src="legend.svg" alt="Legend" />}
            {...props}
        />
    );
    return container.querySelector<HTMLElement>(".chart-under-test")!;
}

describe("ChartPreview", () => {
    it("never grows past its parent", () => {
        const chart = renderChart({ widthUnit: "pixels", width: 2000, heightUnit: "pixels", height: 2000 });

        expect(chart.style.maxWidth).toBe("100%");
        expect(chart.style.maxHeight).toBe("100%");
        expect(chart.parentElement!.style.display).toBe("flex");
        expect(chart.parentElement!.style.maxWidth).toBe("100%");
    });

    it("applies percentage width", () => {
        expect(renderChart({ widthUnit: "percentage", width: 50 }).style.width).toBe("50%");
    });

    it("applies pixel width and height", () => {
        const chart = renderChart({ widthUnit: "pixels", width: 400, heightUnit: "pixels", height: 250 });

        expect(chart.style.width).toBe("400px");
        expect(chart.style.height).toBe("250px");
    });

    it("applies height as percentage of parent", () => {
        expect(renderChart({ heightUnit: "percentageOfParent", height: 60 }).style.height).toBe("60%");
    });

    it("leaves height to the aspect ratio when height is a percentage of width", () => {
        expect(renderChart({ heightUnit: "percentageOfWidth", height: 50 }).style.height).toBe("");
    });

    it("lets the plot image shrink with the chart", () => {
        const image = renderChart().querySelector<HTMLElement>("img[alt='Plot']")!;

        expect(image.style.width).toBe("");
        expect(image.style.minWidth).toBe("0");
    });

    it("renders the legend only when enabled", () => {
        expect(renderChart({ showLegend: false }).querySelector("img[alt='Legend']")).toBeNull();
        expect(renderChart({ showLegend: true }).querySelector("img[alt='Legend']")).not.toBeNull();
    });
});
