import { shallow } from "enzyme";
import { createElement } from "react";

import AceEditor from "react-ace";
import { Playground } from "../components/Playground";
import { PiePlayground, PiePlaygroundProps } from "../PieChart/components/PiePlayground";
import { Panel } from "../components/Panel";
import { Select } from "../components/Select";

describe("PiePlayground", () => {
    let defaultProps: PiePlaygroundProps;
    const renderSeriesPlayground = (props: PiePlaygroundProps) => shallow(createElement(PiePlayground, props));

    beforeEach(() => {
        defaultProps = {
            layoutOptions: "{}",
            modelerLayoutConfigs: "{}",
            dataOptions: "{}",
            modelerDataConfigs: "{}"
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
                    options: [
                        { name: "Layout", value: "layout", isDefaultSelected: true },
                        { name: "Data", value: "data", isDefaultSelected: false }
                    ]
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
        it("renders no panels when no data options are provided", () => {
            defaultProps.dataOptions = "";
            const playground = renderSeriesPlayground(defaultProps);
            playground.setState({ activeOption: "0" });

            expect(playground.find(Panel).length).toBe(0);
        });

        it("renders the data panels when raw data is provided", () => {
            const playground = renderSeriesPlayground(defaultProps);
            playground.setState({ activeOption: "0" });

            expect(playground).toBeElement(
                createElement(
                    Playground,
                    {},
                    createElement(
                        Panel,
                        {
                            key: "data",
                            heading: "Custom settings",
                            headingClass: "item-header"
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
                            key: "modeler",
                            heading: "Settings from the Modeler",
                            headingClass: "read-only"
                        },
                        Playground.renderAceEditor({
                            value: "{}",
                            readOnly: true,
                            overwriteValue: "{}",
                            onValidate: jasmine.any(Function)
                        })
                    ),
                    createElement(Select, {
                        onChange: jasmine.any(Function),
                        options: [
                            { name: "Layout", value: "layout", isDefaultSelected: true },
                            { name: "Data", value: "data", isDefaultSelected: false }
                        ]
                    })
                )
            );
        });
    });

    it("renders the specified children last", () => {
        const playground = shallow(createElement(PiePlayground, defaultProps, createElement("div")));

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
