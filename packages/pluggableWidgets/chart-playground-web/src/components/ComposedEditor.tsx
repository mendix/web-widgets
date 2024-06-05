import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import classNames from "classnames";
import { Fragment, ReactElement, ReactNode, createElement, useCallback, useRef, useState } from "react";
import "../ui/Playground.scss";
import { Select, SelectOption, Sidebar, SidebarHeader, SidebarHeaderTools, SidebarPanel } from "./Sidebar";
import { CodeEditor, EditorChangeHandler } from "./CodeEditor";

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
                <div className="sidebar-content-body">{renderPanels}</div>
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
            <span>i</span>
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
                        <p>The JSON can be copied and pasted into the widgets or trace properties in the Studio Pro.</p>
                    </Alert>
                </div>
            ) : null}
        </button>
    );
};

export interface ComposedEditorProps {
    defaultEditorValue: string;
    onEditorChange: EditorChangeHandler;
    modelerCode: string;
    onViewSelectChange: (value: string) => void;
    viewSelectValue: string;
    viewSelectOptions: SelectOption[];
}

function DocsLink(props: { currentView: string }): React.ReactElement {
    const href =
        props.currentView === "layout"
            ? "https://plotly.com/javascript/reference/layout/"
            : props.currentView === "config"
            ? "https://plotly.com/javascript/configuration-options/"
            : "https://plotly.com/javascript/reference/";

    const text = props.currentView === "layout" ? "Layout" : props.currentView === "config" ? "Config" : "Trace";

    return (
        <a href={href} target="_blank" rel="noreferrer">
            See all {text} attributes.
        </a>
    );
}

function TabGuard(props: { children: React.ReactNode }): React.ReactElement {
    return (
        <div
            onKeyDown={event => {
                if (event.code === "Tab") {
                    event.stopPropagation();
                }
            }}
        >
            {props.children}
        </div>
    );
}

export function ComposedEditor(props: ComposedEditorProps): React.ReactElement {
    const topPanelHeader = (
        <Fragment>
            <div className="widget-info-bar">
                <span style={{ flexGrow: 1 }}>Custom settings</span>
                <SidebarContentTooltip />
            </div>
            <div className="widget-info-bar">
                <small>
                    Press <kbd>Esc</kbd> + <kbd>Tab</kbd> to move focus from editor.
                </small>
            </div>
            <div className="widget-info-bar">
                <small>
                    <DocsLink currentView={props.viewSelectValue} />
                </small>
            </div>
        </Fragment>
    );
    const renderPanels = (
        <Fragment>
            <SidebarPanel
                className="widget-custom-config"
                key={props.viewSelectValue}
                headingClassName="editor-header"
                heading={topPanelHeader}
            >
                <TabGuard>
                    <CodeEditor
                        defaultValue={props.defaultEditorValue}
                        onChange={props.onEditorChange}
                        height="var(--editor-h)"
                    />
                </TabGuard>
            </SidebarPanel>
            <SidebarPanel
                className="widget-modeler-config"
                key="modeler"
                heading="Settings from the Studio Pro"
                headingClassName="settings-header read-only"
            >
                <CodeEditor
                    key={props.modelerCode}
                    readOnly
                    defaultValue={props.modelerCode}
                    height="var(--static-settings-h)"
                />
            </SidebarPanel>
        </Fragment>
    );

    const renderSidebarHeaderTools = (
        <SidebarHeaderTools>
            <Select onChange={props.onViewSelectChange} options={props.viewSelectOptions} />
        </SidebarHeaderTools>
    );

    return <Wrapper renderPanels={renderPanels} renderSidebarHeaderTools={renderSidebarHeaderTools} />;
}
