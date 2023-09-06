import {
    createElement,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import classNames from "classnames";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import { Sidebar, SidebarHeader, SidebarHeaderTools, SidebarPanel, Select } from "./Sidebar";
import { emptyObjectString, ifNonEmptyStringElseEmptyObjectString } from "./utils";
import { ChartProps } from "../Chart";

import "../../ui/Playground.scss";
import infoIconSvg from "../../assets/information-circle.svg";

interface PlaygroundProps {
    children: ReactNode;
    renderPanels: ReactNode;
    renderSidebarHeaderTools: ReactNode;
}

const Wrapper = ({ children, renderPanels, renderSidebarHeaderTools }: PlaygroundProps): ReactElement => {
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
            {children}
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
            <img src={infoIconSvg} className="info-tooltip-icon" alt="Show inline editor information" />
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

export const Playground = {
    Wrapper,
    Panel: SidebarPanel,
    SidebarHeaderTools,
    Select
};

interface ChartsPlaygroundState {
    data: ChartProps["data"];
    customLayout?: string;
    customConfig?: string;
    customSeries?: string;
}

function convertJSToJSON(value: string): string {
    const properJSON = value.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, `"$2": `).replace(/'/g, `"`);

    return JSON.stringify(JSON.parse(properJSON), null, 2);
}

type PlaygroundView = "layout" | "config" | string;

function createEmptySeriesArray(size: number): string[] {
    return new Array(size).fill(emptyObjectString);
}

export const useChartsPlaygroundState = ({
    data,
    customConfig,
    customLayout
}: ChartsPlaygroundState): {
    activeEditableCode: string;
    activeView: PlaygroundView;
    changeActiveView: Dispatch<SetStateAction<PlaygroundView>>;
    changeEditableCode: (value: string) => void;
    changeEditableCodeIsValid: (isValid: boolean) => void;
    editedConfig: NonNullable<ChartProps["customConfig"]>;
    editedData: ChartProps["data"];
    editedLayout: NonNullable<ChartProps["customLayout"]>;
} => {
    const [activeView, setActiveView] = useState<PlaygroundView>("layout");

    const [editableConfig, setEditableConfig] = useState(ifNonEmptyStringElseEmptyObjectString(customConfig));
    const [editableLayout, setEditableLayout] = useState(ifNonEmptyStringElseEmptyObjectString(customLayout));
    const [editableSeries, setEditableSeries] = useState(createEmptySeriesArray(data.length));

    const editableCodeUpdateTimeoutId = useRef<number | null>(null);
    const editableCodeIsValid = useRef(false);

    useEffect(() => {
        if (data.length !== editableSeries.length) {
            setEditableSeries(createEmptySeriesArray(data.length));
        }
    }, [data.length, editableSeries.length]);

    const changeEditableCode = useCallback(
        (value: string) => {
            if (editableCodeUpdateTimeoutId.current) {
                clearTimeout(editableCodeUpdateTimeoutId.current);
            }
            editableCodeUpdateTimeoutId.current = window.setTimeout(() => {
                try {
                    const newCode = editableCodeIsValid.current
                        ? JSON.stringify(JSON.parse(value), null, 2)
                        : convertJSToJSON(value);
                    switch (activeView) {
                        case "layout":
                            setEditableLayout(newCode);
                            break;
                        case "config":
                            setEditableConfig(newCode);
                            break;
                        default:
                            const playgroundIndex = parseInt(activeView, 10);
                            setEditableSeries(oldSettings =>
                                oldSettings.map((oldCode, index) => (index === playgroundIndex ? newCode : oldCode))
                            );
                            break;
                    }
                } catch {
                    editableCodeIsValid.current = false;
                }
            }, 1000);
        },
        [activeView]
    );

    const changeEditableCodeIsValid = useCallback((isValid: boolean) => {
        editableCodeIsValid.current = isValid;
    }, []);

    const editedData = useMemo(
        () =>
            data.map((serie, index) => ({
                ...serie,
                customSeriesOptions: editableSeries[index]
            })),
        [data, editableSeries]
    );

    const activeEditableCode = useMemo(() => {
        if (activeView === "layout") {
            return editableLayout;
        }
        if (activeView === "config") {
            return editableConfig;
        }
        return editableSeries[parseInt(activeView, 10)];
    }, [activeView, editableConfig, editableLayout, editableSeries]);

    return {
        activeEditableCode,
        activeView,
        changeActiveView: setActiveView,
        changeEditableCode,
        changeEditableCodeIsValid,
        editedConfig: editableConfig,
        editedData,
        editedLayout: editableLayout
    };
};
