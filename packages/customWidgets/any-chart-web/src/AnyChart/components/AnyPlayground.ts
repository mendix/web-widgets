import { Component, ReactElement, createElement } from "react";
import { Playground } from "../../components/Playground";
import { SidebarHeaderTools } from "../../components/SidebarHeaderTools";

import { Alert } from "../../components/Alert";
import AnyChart from "./AnyChart";
import { AnyChartDataHandlerProps } from "./AnyChartDataHandler";
import { defaultConfigOptions } from "../utils/configs";
import { Panel, PanelProps } from "../../components/Panel";
import { Select } from "../../components/Select";

interface AnyChartPlaygroundState {
    activeOption: string;
}

export class AnyChartPlayground extends Component<AnyChartDataHandlerProps, AnyChartPlaygroundState> {
    state: AnyChartPlaygroundState = {
        activeOption: "layout"
    };
    private timeoutId?: number;
    private isValid = false;

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: `widget-charts-any-alert` }, this.props.alertMessage);
        }

        return createElement(Playground, {},
            ...this.renderPanels(),
            this.renderHeaderTools(),
            createElement(AnyChart, this.props)
        );
    }

    private renderPanels(): (ReactElement<PanelProps> | null)[] {
        if (this.state.activeOption === "layout") {
            return this.renderLayoutPanels();
        } else if (this.state.activeOption === "config") {
            return this.renderConfigPanels();
        }

        return this.renderDataPanes();
    }

    private renderLayoutPanels() {
        return [
            createElement(Panel,
                {
                    key: "layout",
                    heading: "Dynamic"
                },
                Playground.renderAceEditor({
                    value: this.formatJSONString(`${this.props.attributeLayout || "{\n\n}"}`),
                    onChange: value => this.onUpdate("layoutDynamic", value),
                    onValidate: this.onValidate
                })
            ),
            createElement(Panel,
                {
                    key: "modeler",
                    heading: "Static",
                    headingClass: "read-only"
                },
                Playground.renderAceEditor({
                    value: this.formatJSONString(this.props.layoutStatic || "{\n\n}"),
                    onChange: value => this.onUpdate("layoutStatic", value),
                    overwriteValue: this.props.attributeLayout,
                    onValidate: this.onValidate
                })
            )
        ];
    }

    private renderDataPanes() {
        if (this.props.attributeData) {

            return [
                createElement(Panel,
                    {
                        key: "data",
                        heading: "Dynamic",
                        headingClass: "item-header"
                    },
                    Playground.renderAceEditor({
                        value: this.formatJSONString(`${this.props.attributeData || "{\n\n}"}`),
                        onChange: value => this.onUpdate("dataDynamic", value),
                        onValidate: this.onValidate
                    })
                ),
                createElement(Panel,
                    {
                        key: "modeler",
                        heading: "Static",
                        headingClass: "read-only"
                    },
                    Playground.renderAceEditor({
                        value: this.formatJSONString(this.props.dataStatic || "{\n\n}"),
                        onChange: value => this.onUpdate("dataStatic", value),
                        overwriteValue: this.props.attributeData,
                        onValidate: this.onValidate
                    })
                )
            ];
        }

        return [];
    }

    private renderConfigPanels() {
        if (this.props.attributeData) {

            return [
                createElement(Panel,
                    {
                        key: "config",
                        heading: "Configuration settings"
                    },
                    Playground.renderAceEditor({
                        value: this.formatJSONString(`${this.props.configurationOptions || "{\n\n}"}`),
                        onChange: value => this.onUpdate("config", value),
                        onValidate: this.onValidate
                    })
                ),
                createElement(Panel,
                    {
                        key: "default",
                        heading: "Default configuration",
                        headingClass: "read-only"
                    },
                    Playground.renderAceEditor({
                        value: this.formatJSONString(JSON.stringify(defaultConfigOptions)),
                        readOnly: true,
                        overwriteValue: this.props.configurationOptions,
                        onValidate: this.onValidate
                    })
                )
            ];
        }

        return [];
    }

    private renderHeaderTools(): ReactElement<any> {
        return createElement(SidebarHeaderTools, {},
            createElement(Select, {
                onChange: this.updateView,
                options: [
                    { name: "Layout", value: "layout", isDefaultSelected: true },
                    { name: "Data", value: "data", isDefaultSelected: false },
                    { name: "Configuration", value: "config", isDefaultSelected: false }
                ]
            })
        );
    }

    private onValidate = (annotations: object[]) => {
        this.isValid = !annotations.length;
    }

    private onUpdate = (source: string, value: string) => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(() => {
            try {
                if (this.isValid) {
                    this.updateChart(source, this.formatJSONString(value));
                } else {
                    this.updateChart(source, Playground.convertJSToJSON(value));
                }
            } catch (error) {
                this.isValid = false;
                console.error("An error occured while updating the playground chart", error); // tslint:disable-line
            }
        }, 1000);
    }

    private updateChart = (source: string, value: string) => {
        const cleanValue = Playground.removeTrailingNewLine(value);
        this.props.updateDataFromPlayground(this.props.instanceID, {
            attributeLayout: source === "layoutDynamic" ? cleanValue : this.props.attributeLayout,
            attributeData: source === "dataDynamic" ? cleanValue : this.props.attributeData,
            layoutStatic: source === "layoutStatic" ? cleanValue : this.props.layoutStatic,
            dataStatic: source === "dataStatic" ? cleanValue : this.props.dataStatic,
            configurationOptions: source === "config" ? cleanValue : this.props.configurationOptions
        });
    }

    private updateView = (activeOption: string) => {
        this.setState({ activeOption });
    }

    private formatJSONString(value: string) {
        const stringValue = JSON.stringify(JSON.parse(value), null, 2);

        return stringValue === "{}" ? "{\n\n}" : stringValue;
    }
}
