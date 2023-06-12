import { Component, ReactChild, createElement, isValidElement, PropsWithChildren } from "react";
import AceEditor, { IMarker } from "react-ace";
import * as classNames from "classnames";
import { Operation, compare } from "fast-json-patch";
import * as jsonMap from "json-source-map";

import AnyChart from "../AnyChart/components/AnyChart";
import { InfoTooltip } from "./InfoTooltip";
import { MendixButton } from "./MendixButton";
import { Panel } from "./Panel";
import { PlaygroundInfo } from "./PlaygroundInfo";
import PlotlyChart from "./PlotlyChart";
import { Sidebar } from "./Sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";
import { SidebarHeaderTools } from "./SidebarHeaderTools";

import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-github";
import "../ui/Playground.scss";

interface PlaygroundState {
    showEditor: boolean;
    showTooltip: boolean;
}

export interface RenderAceEditorOptions {
    value: string;
    onChange?: (value: string) => void;
    onValidate: (annotations: object[]) => void;
    readOnly?: boolean;
    overwriteValue?: string;
}

type SidebarChildren = typeof Panel | typeof PlotlyChart | typeof AnyChart | typeof SidebarHeaderTools;

export class Playground extends Component<PropsWithChildren<{}>, PlaygroundState> {
    state = {
        showEditor: false,
        showTooltip: false
    };

    render() {
        return createElement(
            "div",
            {
                className: classNames("widget-charts-playground", {
                    "playground-open": this.state.showEditor
                })
            },
            createElement(
                Sidebar,
                {
                    open: this.state.showEditor,
                    onBlur: this.closeEditor,
                    onClick: this.closeTooltip,
                    onClose: this.toggleShowEditor
                },
                createElement(SidebarHeader, { className: "row" }, this.renderContent(SidebarHeaderTools)),
                createElement(
                    SidebarContent,
                    {},
                    createElement(
                        InfoTooltip,
                        { show: this.state.showTooltip, onClick: this.toggleTooltip },
                        createElement(PlaygroundInfo)
                    ),
                    this.renderContent(Panel)
                )
            ),
            createElement(
                "div",
                { className: "widget-charts-playground-toggle" },
                createElement(MendixButton, { onClick: this.toggleShowEditor }, "Toggle Editor")
            ),
            this.renderContent(PlotlyChart),
            this.renderContent(AnyChart)
        );
    }

    private renderContent(component: SidebarChildren): ReactChild | (ReactChild | any | boolean)[] | null {
        if (this.props.children && Array.isArray(this.props.children)) {
            return this.props.children.filter(child => isValidElement(child) && child.type === component);
        } else if (isValidElement(this.props.children) && this.props.children.type === component) {
            return this.props.children;
        }

        return null;
    }

    private toggleShowEditor = () => {
        this.setState({ showEditor: !this.state.showEditor });
    };

    private closeEditor = () => {
        if (this.state.showEditor) {
            this.setState({ showEditor: false });
        }
    };

    private closeTooltip = () => {
        if (this.state.showTooltip) {
            this.setState({ showTooltip: false });
        }
    };

    private toggleTooltip = () => {
        this.setState({ showTooltip: !this.state.showTooltip });
    };

    public static removeTrailingNewLine(value: string): string {
        const splitValue = value.split("\n");
        if (splitValue[splitValue.length - 1] === "") {
            splitValue.pop();
        }

        return splitValue.join("\n");
    }

    public static renderAceEditor(options: RenderAceEditorOptions) {
        const { onChange, onValidate, overwriteValue, readOnly, value } = options;
        const markers = Playground.getMarker(value, overwriteValue);

        return createElement(AceEditor, {
            mode: "json",
            value: `${value}\n`,
            readOnly,
            onChange,
            theme: "github",
            className: readOnly ? "ace-editor-read-only" : undefined,
            markers,
            maxLines: 1000, // crappy attempt to avoid a third scroll bar
            onValidate,
            editorProps: { $blockScrolling: Infinity },
            setOptions: {
                useWorker: false,
                showLineNumbers: false,
                highlightActiveLine: false,
                highlightGutterLine: true
            }
        });
    }

    private static getMarker(left: string, right?: string): IMarker[] {
        const markers: IMarker[] = [];
        if (right) {
            const diffs = compare(JSON.parse(left), JSON.parse(right));
            diffs.forEach((diff: any) => {
                if (diff.op === "replace") {
                    const pos = Playground.getStartAndEndPosOfDiff(left, diff);
                    if (pos) {
                        markers.push(pos);
                    }
                }
            });
        }

        return markers;
    }

    private static getStartAndEndPosOfDiff(textValue: string, diff: Operation): IMarker | null {
        const result = jsonMap.parse(textValue);
        const pointer = result.pointers[diff.path];
        if (pointer && pointer.key && pointer.valueEnd) {
            return {
                startRow: pointer.key.line,
                startCol: pointer.key.column,
                endRow: pointer.valueEnd.line,
                endCol: pointer.valueEnd.column,
                type: "text",
                className: "replaced-config"
            };
        }

        return null;
    }

    public static convertJSToJSON(value: string) {
        const properJSON = value.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, `"$2": `).replace(/'/g, `"`);

        return JSON.stringify(JSON.parse(properJSON), null, 2);
    }
}
