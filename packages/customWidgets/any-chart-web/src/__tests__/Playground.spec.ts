import { shallow } from "enzyme";
import { createElement } from "react";

import AceEditor from "react-ace";
import { InfoTooltip } from "../components/InfoTooltip";
import { MendixButton } from "../components/MendixButton";
import { Panel } from "../components/Panel";
import { Playground, RenderAceEditorOptions } from "../components/Playground";
import { PlaygroundInfo } from "../components/PlaygroundInfo";
import PlotlyChart from "../components/PlotlyChart";
import { Sidebar } from "../components/Sidebar";
import { SidebarContent } from "../components/SidebarContent";
import { SidebarHeader } from "../components/SidebarHeader";
import { SidebarHeaderTools } from "../components/SidebarHeaderTools";

describe("Playground", () => {
    it("should render the structure correctly", () => {
        const playground = shallow(createElement(Playground));

        expect(playground).toBeElement(
            createElement(
                "div",
                { className: "widget-charts-playground" },
                createElement(
                    Sidebar,
                    {
                        open: false,
                        onBlur: jasmine.any(Function),
                        onClick: jasmine.any(Function),
                        onClose: jasmine.any(Function)
                    },
                    createElement(SidebarHeader, { className: "row" }),
                    createElement(
                        SidebarContent,
                        {},
                        createElement(
                            InfoTooltip,
                            { show: false, onClick: jasmine.any(Function) },
                            createElement(PlaygroundInfo)
                        )
                    )
                ),
                createElement(
                    "div",
                    { className: "widget-charts-playground-toggle" },
                    createElement(MendixButton, { onClick: jasmine.any(Function) }, "Toggle Editor")
                )
            )
        );
    });

    it("should not show the editor initially", () => {
        const playground = shallow(createElement(Playground));

        expect(playground.state().showEditor).toBe(false);
    });

    it("should not show the tooltip initially", () => {
        const playground = shallow(createElement(Playground, {}));

        expect(playground.state().showTooltip).toBe(false);
    });

    it("should render the sidebar header with the playground options", () => {
        const playground = shallow(createElement(Playground, {}, createElement(SidebarHeaderTools)));
        const sidebarHeader = playground.find(SidebarHeader);
        const headerTools = sidebarHeader.find(SidebarHeaderTools);

        expect(headerTools.length).toBe(1);
    });

    it("should render the sidebar content panels", () => {
        const playground = shallow(createElement(Playground, {}, createElement(Panel), createElement(Panel)));
        const sidebarContent = playground.find(SidebarContent);
        const panel = sidebarContent.find(Panel);

        expect(panel.length).toBe(2);
    });

    it("should render the chart", () => {
        const playground = shallow(createElement(Playground, {}, createElement(PlotlyChart)));
        const chart = playground.find(PlotlyChart);

        expect(chart.length).toBe(1);
    });

    describe("with panels, a chart and a content switcher", () => {
        it("renders all in their respective positions", () => {
            const playground = shallow(
                createElement(
                    Playground,
                    {},
                    createElement(Panel),
                    createElement(Panel),
                    createElement(PlotlyChart),
                    createElement(SidebarHeaderTools)
                )
            );

            const sidebarHeader = playground.find(SidebarHeader);
            const headerTools = sidebarHeader.find(SidebarHeaderTools);
            expect(headerTools.length).toBe(1);

            const sidebarContent = playground.find(SidebarContent);
            const panel = sidebarContent.find(Panel);
            expect(panel.length).toBe(2);

            const chart = playground.find(PlotlyChart);
            expect(chart.length).toBe(1);
        });
    });

    describe("#removeTrailingNewLine", () => {
        it("removes any trailing new lines from the supplied string", () => {
            const value = "String with blank lines at the end\n\n";
            const strippedValue = Playground.removeTrailingNewLine(value);

            expect(value).not.toBe(strippedValue);
            expect(strippedValue).toBe("String with blank lines at the end\n");
        });
    });

    describe("#renderAceEditor", () => {
        it("renders the AceEditor with the specified props", () => {
            const options: RenderAceEditorOptions = {
                value: "{ 'x': 1 }",
                onValidate: () => jasmine.createSpy("onValidate"),
                onChange: () => jasmine.createSpy("onChange"),
                readOnly: true
            };

            expect(Playground.renderAceEditor(options)).toBeElement(
                createElement(AceEditor, {
                    mode: "json",
                    value: `${options.value}\n`,
                    readOnly: true,
                    onChange: jasmine.any(Function),
                    theme: "github",
                    className: "ace-editor-read-only",
                    maxLines: 1000,
                    markers: jasmine.any(Array) as any,
                    onValidate: jasmine.any(Function),
                    editorProps: { $blockScrolling: Infinity },
                    setOptions: { showLineNumbers: false, highlightActiveLine: false, highlightGutterLine: true }
                })
            );
        });
    });
});
