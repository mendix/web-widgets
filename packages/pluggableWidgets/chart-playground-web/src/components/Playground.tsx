import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import classNames from "classnames";
import { Fragment, ReactElement, ReactNode, createElement, useCallback, useMemo, useRef, useState } from "react";
import { Select, Sidebar, SidebarHeader, SidebarHeaderTools, SidebarPanel } from "./Sidebar";

import { PlaygroundData, usePlaygroundContext } from "@mendix/shared-charts";
// import type { Config, Data, Layout } from "plotly.js";
import "../ui/Playground.scss";
type Config = object;
type Data = object;
type Layout = object;
interface WrapperProps {
    renderPanels: ReactNode;
    renderSidebarHeaderTools: ReactNode;
}

const Wrapper = ({ renderPanels, renderSidebarHeaderTools }: WrapperProps): ReactElement => {
    const [showEditor, setShowEditor] = useState(false);
    const closeEditor = useCallback(() => setShowEditor(false), []);
    const toggleEditor = useCallback(() => setShowEditor(isOpen => !isOpen), []);

    return (
        <div
            className={classNames("widget-charts-playground", {
                "playground-open": showEditor
            })}
        >
            <Sidebar isOpen={showEditor} onBlur={closeEditor}>
                <SidebarHeader className="row" onClose={closeEditor}>
                    {renderSidebarHeaderTools}
                </SidebarHeader>
                <div className="sidebar-content-body">
                    <SidebarContentTooltip />
                    {renderPanels}
                </div>
            </Sidebar>
            <div className="widget-charts-playground-toggle">
                <button className="mx-button btn" onClick={toggleEditor}>
                    Toggle Editor
                </button>
            </div>
        </div>
    );
};

const SidebarContentTooltip = (): ReactElement => {
    const [tooltipIsOpen, setTooltipIsOpen] = useState(false);
    const tooltipTriggerRef = useRef<HTMLButtonElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    useOnClickOutside(tooltipRef, () => setTooltipIsOpen(false));

    return (
        <button className="info-tooltip" ref={tooltipTriggerRef} onClick={() => setTooltipIsOpen(true)}>
            {/* <img src={infoIconSvg} className="info-tooltip-icon" alt="Show inline editor information" /> */}ℹ
            {tooltipIsOpen ? (
                <div
                    ref={tooltipRef}
                    className="info-tooltip-info"
                    style={{
                        width:
                            tooltipTriggerRef.current && tooltipTriggerRef.current.parentElement
                                ? tooltipTriggerRef.current.parentElement.clientWidth * 0.9
                                : "auto"
                    }}
                >
                    <Alert bootstrapStyle="info" className="info-tooltip-info-content">
                        <p>
                            <strong>Changes made in this editor are only for preview purposes.</strong>
                        </p>
                        <p>The JSON can be copied and pasted into the widgets properties in the desktop modeler</p>
                        <p>
                            Check out the chart options here:{" "}
                            <a href="https://plot.ly/javascript/reference/" target="_blank" rel="noreferrer">
                                https://plot.ly/javascript/reference/
                            </a>
                        </p>
                    </Alert>
                </div>
            ) : null}
        </button>
    );
};

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions"];

type ConfigKey = "layout" | "config" | number;

type PlaygroundViewProps = {
    data: PlaygroundData;
};

export function PlaygroundView(props: PlaygroundViewProps): React.ReactElement {
    const { store } = props.data;
    const [configKey, setConfigKey] = useState<ConfigKey>("layout");
    const activeView = configKey.toString();
    const activeEditorCode = getEditorCode(props.data, configKey);
    const activeModelerCode = useMemo(() => getModelerCode(props.data, configKey), [props.data, configKey]);

    const renderPanels = (
        <Fragment>
            <SidebarPanel key={activeView} heading="Custom settings">
                <textarea value={activeEditorCode} onChange={event => store.set(configKey, event.target.value)} />
            </SidebarPanel>
            <SidebarPanel key="modeler" heading="Settings from the Studio/Studio Pro" headingClassName="read-only">
                <pre>
                    <code>{JSON.stringify(activeModelerCode, null, 2)}</code>
                </pre>
                {/* <CodeEditor
                    readOnly
                    value={JSON.stringify(activeModelerCode, null, 2)}
                    overwriteValue={activeEditableCode}
                /> */}
            </SidebarPanel>
        </Fragment>
    );

    const renderSidebarHeaderTools = (
        <SidebarHeaderTools>
            <Select
                onChange={value => {
                    if (value === "layout" || value === "config") {
                        setConfigKey(value);
                    } else {
                        const n = parseInt(value, 10);
                        setConfigKey(isNaN(n) ? "layout" : n);
                    }
                }}
                options={[
                    { name: "Layout", value: "layout", isDefaultSelected: true },
                    ...props.data.plotData.map((trace, index) => ({
                        name: trace.name || `trace ${index}`,
                        value: index,
                        isDefaultSelected: false
                    })),
                    { name: "Configuration", value: "config", isDefaultSelected: false }
                ]}
            />
        </SidebarHeaderTools>
    );

    return <Wrapper renderPanels={renderPanels} renderSidebarHeaderTools={renderSidebarHeaderTools} />;
}

function getEditorCode({ store }: PlaygroundData, key: ConfigKey): string {
    let value = typeof key === "number" ? store.state.data.at(key) : store.state[key];
    value = value ?? '{ "error": "value is unavailable" }';
    return value;
}

function getModelerCode(data: PlaygroundData, key: ConfigKey): Partial<Data> | Partial<Layout> | Partial<Config> {
    if (key === "layout") {
        return data.layoutOptions;
    }
    if (key === "config") {
        return data.configOptions;
    }

    const entries = Object.entries(data.plotData.at(key) ?? {}).filter(([key]) => !irrelevantSeriesKeys.includes(key));
    return Object.fromEntries(entries) as Partial<Data>;
}

export function Playground(): React.ReactElement {
    const ctx = usePlaygroundContext();
    if ("error" in ctx) {
        return <Alert bootstrapStyle="danger">{ctx.error.message}</Alert>;
    }

    return <PlaygroundView data={ctx.data} />;
}

// interface ChartsPlaygroundState {
//     data: ChartProps["data"];
//     customLayout?: string;
//     customConfig?: string;
//     customSeries?: string;
// }

// function convertJSToJSON(value: string): string {
//     const properJSON = value.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, `"$2": `).replace(/'/g, `"`);

//     return JSON.stringify(JSON.parse(properJSON), null, 2);
// }

// type PlaygroundView = "layout" | "config" | string;

// function createEmptySeriesArray(size: number): string[] {
//     return new Array(size).fill(emptyObjectString);
// }

// export const useChartsPlaygroundState = (): {
//     activeEditableCode: string;
//     activeView: PlaygroundView;
//     changeActiveView: Dispatch<SetStateAction<PlaygroundView>>;
//     changeEditableCode: (value: string) => void;
//     changeEditableCodeIsValid: (isValid: boolean) => void;
//     editedConfig: NonNullable<ChartProps["customConfig"]>;
//     editedData: ChartProps["data"];
//     editedLayout: NonNullable<ChartProps["customLayout"]>;
// } => {
//     const [activeView, setActiveView] = useState<PlaygroundView>("layout");

//     const [editableConfig, setEditableConfig] = useState(ifNonEmptyStringElseEmptyObjectString(customConfig));
//     const [editableLayout, setEditableLayout] = useState(ifNonEmptyStringElseEmptyObjectString(customLayout));
//     const [editableSeries, setEditableSeries] = useState(createEmptySeriesArray(data.length));

//     const editableCodeUpdateTimeoutId = useRef<number | null>(null);
//     const editableCodeIsValid = useRef(false);

//     const changeEditableCode = useCallback(
//         (value: string) => {
//             if (editableCodeUpdateTimeoutId.current) {
//                 clearTimeout(editableCodeUpdateTimeoutId.current);
//             }
//             editableCodeUpdateTimeoutId.current = window.setTimeout(() => {
//                 try {
//                     const newCode = editableCodeIsValid.current
//                         ? JSON.stringify(JSON.parse(value), null, 2)
//                         : convertJSToJSON(value);
//                     switch (activeView) {
//                         case "layout":
//                             setEditableLayout(newCode);
//                             break;
//                         case "config":
//                             setEditableConfig(newCode);
//                             break;
//                         default:
//                             const playgroundIndex = parseInt(activeView, 10);
//                             setEditableSeries(oldSettings =>
//                                 oldSettings.map((oldCode, index) => (index === playgroundIndex ? newCode : oldCode))
//                             );
//                             break;
//                     }
//                 } catch {
//                     editableCodeIsValid.current = false;
//                 }
//             }, 1000);
//         },
//         [activeView]
//     );

//     const changeEditableCodeIsValid = useCallback((isValid: boolean) => {
//         editableCodeIsValid.current = isValid;
//     }, []);

//     const editedData = useMemo(
//         () =>
//             data.map((serie, index) => ({
//                 ...serie,
//                 customSeriesOptions: editableSeries[index]
//             })),
//         [data, editableSeries]
//     );

//     const activeEditableCode = useMemo(() => {
//         if (activeView === "layout") {
//             return editableLayout;
//         }
//         if (activeView === "config") {
//             return editableConfig;
//         }
//         return editableSeries[parseInt(activeView, 10)];
//     }, [activeView, editableConfig, editableLayout, editableSeries]);

//     return {
//         activeEditableCode,
//         activeView,
//         changeActiveView: setActiveView,
//         changeEditableCode,
//         changeEditableCodeIsValid,
//         editedConfig: editableConfig,
//         editedData,
//         editedLayout: editableLayout
//     };
// };
