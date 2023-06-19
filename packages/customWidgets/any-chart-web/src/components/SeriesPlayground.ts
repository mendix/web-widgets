import { Component, ReactElement, createElement, PropsWithChildren } from "react";

import { Panel, PanelProps } from "./Panel";
import { Playground } from "./Playground";
import { Select, SelectOption } from "./Select";

import { Data } from "../utils/namespaces";
import SeriesProps = Data.SeriesProps;
import { SidebarHeaderTools } from "./SidebarHeaderTools";

export interface SeriesPlaygroundProps {
    modelerSeriesConfigs?: string[];
    seriesOptions?: string[];
    series?: SeriesProps[];
    onChange?: (layout: string, seriesOptions: string[], config: string) => void;
    layoutOptions: string;
    configurationOptionsDefault?: string;
    configurationOptions?: string;
    modelerLayoutConfigs: string;
}

interface SeriesPlaygroundState {
    activeOption: string;
}

export class SeriesPlayground extends Component<PropsWithChildren<SeriesPlaygroundProps>, SeriesPlaygroundState> {
    state = { activeOption: "layout" };
    private newSeriesOptions: { layout: string; config: string; seriesOptions: string[] } = {
        layout: this.props.layoutOptions || "{}",
        config: this.props.configurationOptions || "{}",
        seriesOptions: this.props.seriesOptions || []
    };
    private timeoutId?: number;
    private isValid = false;

    render() {
        return createElement(Playground, {}, ...this.renderPanels(), this.renderPanelSwitcher(), this.props.children);
    }

    componentWillReceiveProps(nextProps: SeriesPlaygroundProps) {
        this.newSeriesOptions = {
            layout: nextProps.layoutOptions || "{}",
            config: nextProps.configurationOptions || "{}",
            seriesOptions: nextProps.seriesOptions || []
        };
    }

    private renderPanels(): (ReactElement<PanelProps> | null)[] {
        if (this.state.activeOption === "layout") {
            return this.renderLayoutPanels();
        }
        if (this.state.activeOption === "config") {
            return this.renderConfigPanels();
        }

        return this.renderSeriesPanels(parseInt(this.state.activeOption, 10));
    }

    private renderLayoutPanels() {
        return [
            createElement(
                Panel,
                {
                    key: "layout",
                    heading: "Custom settings"
                },
                Playground.renderAceEditor({
                    value: `${this.props.layoutOptions}`,
                    onChange: value => this.onUpdate("layout", value),
                    onValidate: this.onValidate
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
                    value: this.props.modelerLayoutConfigs,
                    readOnly: true,
                    overwriteValue: this.props.layoutOptions,
                    onValidate: this.onValidate
                })
            )
        ];
    }

    private renderConfigPanels() {
        return [
            createElement(
                Panel,
                {
                    key: "config",
                    heading: "Custom settings"
                },
                Playground.renderAceEditor({
                    value: `${this.props.configurationOptions}`,
                    onChange: value => this.onUpdate("config", value),
                    onValidate: this.onValidate
                })
            ),
            createElement(
                Panel,
                {
                    key: "default",
                    heading: "Settings from the Modeler",
                    headingClass: "read-only"
                },
                Playground.renderAceEditor({
                    value: this.props.configurationOptionsDefault || "{}",
                    readOnly: true,
                    overwriteValue: this.props.configurationOptions,
                    onValidate: this.onValidate
                })
            )
        ];
    }

    private renderSeriesPanels(activeIndex: number): (ReactElement<PanelProps> | null)[] {
        if (this.props.seriesOptions) {
            const activeSeriesOptions = this.props.seriesOptions[activeIndex];

            return [
                this.renderSeriesOptions(activeSeriesOptions, activeIndex),
                this.renderSeriesModelerConfig(activeIndex)
            ];
        }

        return [];
    }

    private renderPanelSwitcher(): ReactElement<any> | null {
        return createElement(
            SidebarHeaderTools,
            {},
            createElement(Select, {
                onChange: this.updateView,
                options: [
                    { name: "Layout", value: "layout", isDefaultSelected: true },
                    ...this.getSeriesOptions(),
                    { name: "Configuration", value: "config", isDefaultSelected: false }
                ]
            })
        );
    }

    private renderSeriesOptions(seriesOptions: string, index: number): ReactElement<PanelProps> {
        return createElement(
            Panel,
            {
                heading: "Custom settings",
                key: `options-${index}`
            },
            Playground.renderAceEditor({
                value: `${seriesOptions || "{\n\n}"}`,
                onChange: value => this.onUpdate(`${index}`, value),
                onValidate: this.onValidate
            })
        );
    }

    private renderSeriesModelerConfig(index: number): ReactElement<PanelProps> | null {
        if (this.props.modelerSeriesConfigs && this.props.series) {
            return createElement(
                Panel,
                {
                    heading: "Settings from the Modeler",
                    headingClass: "read-only",
                    key: `modeler-${index}`
                },
                Playground.renderAceEditor({
                    value: this.props.modelerSeriesConfigs[index] || "{\n\n}",
                    readOnly: true,
                    overwriteValue: this.props.seriesOptions && this.props.seriesOptions[index],
                    onValidate: this.onValidate
                })
            );
        }

        return null;
    }

    private getSeriesOptions(): SelectOption[] {
        return this.props.series
            ? this.props.series.map((series, index) => ({
                  name: series.name,
                  value: `${index}`,
                  isDefaultSelected: false
              }))
            : [];
    }

    private onValidate = (annotations: object[]) => {
        this.isValid = !annotations.length;
    };

    private onUpdate = (source: string, value: string) => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(() => {
            try {
                if (this.isValid) {
                    this.updateChart(source, JSON.stringify(JSON.parse(value), null, 2));
                } else {
                    this.updateChart(source, Playground.convertJSToJSON(value));
                }
            } catch {
                this.isValid = false;
            }
        }, 1000);
    };

    private updateChart = (source: string, value: string) => {
        const cleanValue = Playground.removeTrailingNewLine(value);
        if (source === "layout") {
            this.newSeriesOptions.layout = cleanValue;
        } else if (source === "config") {
            this.newSeriesOptions.config = cleanValue;
        } else {
            this.newSeriesOptions.seriesOptions[parseInt(source, 10)] = cleanValue;
        }
        if (this.props.onChange) {
            this.props.onChange(
                this.newSeriesOptions.layout,
                this.newSeriesOptions.seriesOptions,
                this.newSeriesOptions.config
            );
        }
    };

    private updateView = (activeOption: string) => {
        this.setState({ activeOption });
    };
}
