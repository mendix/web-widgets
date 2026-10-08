import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { ChartPreview, ChartPreviewProps } from "../ChartPreview";

function renderPreview(showLegend: boolean): void {
    const props: ChartPreviewProps = {
        class: "test-chart",
        showLegend,
        playground: { widgetCount: 0, renderer: ({ children }: { children: ReactNode }) => <div>{children}</div> },
        image: <ChartPreview.PlotImage src="plot.svg" alt="Plot" />,
        legend: <ChartPreview.PlotLegend src="legend.svg" alt="Legend" />
    };
    render(<ChartPreview {...props} />);
}

describe("ChartPreview", () => {
    it("fills the available width up to the legend size", () => {
        renderPreview(true);

        const chart = screen.getByRole("img", { name: "Plot" }).parentElement!;
        expect(chart.style.width).toBe("100%");
        expect(chart.parentElement!.style.display).toBe("flex");
        expect(chart.parentElement!.style.maxWidth).toBe("385px");
        expect(screen.getByRole("img", { name: "Legend" }).style.flexShrink).toBe("0");
    });

    it("caps the width at the plot size when the legend is hidden", () => {
        renderPreview(false);

        const chart = screen.getByRole("img", { name: "Plot" }).parentElement!;
        expect(chart.parentElement!.style.maxWidth).toBe("300px");
        expect(screen.queryByRole("img", { name: "Legend" })).toBeNull();
    });

    it("lets the plot image shrink instead of overflowing", () => {
        renderPreview(true);

        const plot = screen.getByRole("img", { name: "Plot" });
        expect(plot.style.width).toBe("");
        expect(plot.style.minWidth).toMatch(/^0(px)?$/);
    });
});
