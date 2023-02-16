import { shallow } from "enzyme";
import { createElement } from "react";

import { mockMendix } from "../../tests/mocks/Mendix";
import AceEditor from "react-ace";
import { Playground } from "../components/Playground";
import { SeriesPlayground, SeriesPlaygroundProps } from "../components/SeriesPlayground";
import { Panel } from "../components/Panel";
import { Select } from "../components/Select";

describe("SeriesPlayground", () => {
    let defaultProps: SeriesPlaygroundProps;
    const renderSeriesPlayground = (props: SeriesPlaygroundProps) => shallow(createElement(SeriesPlayground, props));

    beforeEach(() => {
        defaultProps = {
            layoutOptions: "{}",
            modelerLayoutConfigs: "{}"
        };
    });

    it("renders the structure correctly", () => {
        const playground = renderSeriesPlayground(defaultProps);

        expect(playground).toBeElement(
            createElement(
                Playground,
                {},
                createElement(
                    Panel,
                    {
                        key: "layout",
                        heading: "Custom settings"
                    },
                    createElement(AceEditor, {
                        mode: "json",
                        value: `${defaultProps.layoutOptions}\n`,
                        readOnly: false,
                        onChange: jasmine.any(Function),
                        theme: "github",
                        maxLines: 1000,
                        markers: jasmine.any(Array) as any,
                        onValidate: jasmine.any(Function),
                        editorProps: { $blockScrolling: Infinity },
                        setOptions: { showLineNumbers: false, highlightActiveLine: false, highlightGutterLine: true }
                    })
                ),
                createElement(
                    Panel,
                    {
                        key: "modeler",
                        heading: "Settings from the Modeler",
                        headingClass: "read-only"
                    },
                    createElement(AceEditor, {
                        mode: "json",
                        value: `${defaultProps.modelerLayoutConfigs}\n`,
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
                ),
                createElement(Select, {
                    onChange: jasmine.any(Function),
                    options: [{ name: "Layout", value: "layout", isDefaultSelected: true }]
                })
            )
        );
    });

    it("renders the layout panels when the active option is layout", () => {
        const playground = renderSeriesPlayground(defaultProps);

        expect(playground.state().activeOption).toBe("layout");
        expect(playground.find(Panel).length).toBe(2);
    });

    describe("whose active option is not layout", () => {
        it("renders no panels when no raw data is provided", () => {
            const playground = renderSeriesPlayground(defaultProps);
            playground.setState({ activeOption: "0" });

            expect(playground.find(Panel).length).toBe(0);
        });

        it("renders the series panels when series options are provided", () => {
            defaultProps.seriesOptions = ["{}", "{}"];
            const playground = renderSeriesPlayground(defaultProps);
            playground.setState({ activeOption: "0" });

            expect(playground).toBeElement(
                createElement(
                    Playground,
                    {},
                    createElement(
                        Panel,
                        {
                            heading: "Custom settings",
                            key: `options-0`
                        },
                        Playground.renderAceEditor({
                            value: "{}",
                            onChange: jasmine.any(Function),
                            onValidate: jasmine.any(Function)
                        })
                    ),
                    createElement(
                        Panel,
                        {
                            heading: "Settings from the Modeler",
                            headingClass: "read-only",
                            key: `modeler-0`
                        },
                        Playground.renderAceEditor({
                            value: "{\n\n}",
                            readOnly: true,
                            overwriteValue: "{}",
                            onValidate: jasmine.any(Function)
                        })
                    )
                )
            );
        });
    });

    it("renders the panel switcher when raw data is specified", () => {
        defaultProps.series = [
            {
                data: [mockMendix.lib.MxObject()] as any,
                series: {
                    name: "Series 1",
                    seriesOptions: "{}",
                    tooltipForm: "myTooltipForm.xml"
                }
            } as any
        ];
        const playground = renderSeriesPlayground(defaultProps);

        expect(playground.find(Select).length).toBe(1);
    });

    it("renders the specified children last", () => {
        const playground = shallow(createElement(SeriesPlayground, defaultProps, createElement("div")));

        expect(playground.children().last().type()).toBe("div");
    });

    it("updates the chart when a valid change is made", done => {
        defaultProps.onChange = jasmine.createSpy("onUpdate");
        const playground = renderSeriesPlayground(defaultProps);
        const playgroundInstance: any = playground.instance();
        playgroundInstance.isValid = true;

        playgroundInstance.onUpdate("layout", "{}");
        window.setTimeout(() => {
            expect(defaultProps.onChange).toHaveBeenCalled();

            playgroundInstance.onUpdate("0", "{}");
            window.setTimeout(() => {
                expect(defaultProps.onChange).toHaveBeenCalled();

                done();
            }, 1000);
        }, 1000);
    });
});
