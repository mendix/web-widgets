import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import classNames from "classnames";
import { Fragment, ReactElement, ReactNode, createElement, useCallback, useRef, useState } from "react";
import "../ui/Playground.scss";
import { Select, SelectOption, Sidebar, SidebarHeader, SidebarHeaderTools, SidebarPanel } from "./Sidebar";
import Editor, { type OnChange } from "@monaco-editor/react";

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
            ℹ
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

export interface ComposedEditorProps {
    defaultEditorValue: string;
    onEditorChange: OnChange;
    modelerCode: string;
    onViewSelectChange: (value: string) => void;
    viewSelectValue: string;
    viewSelectOptions: SelectOption[];
}

export function ComposedEditor(props: ComposedEditorProps): React.ReactElement {
    const renderPanels = (
        <Fragment>
            <SidebarPanel className="widget-custom-config" key={props.viewSelectValue} heading="Custom settings">
                <Editor language="json" defaultValue={props.defaultEditorValue} onChange={props.onEditorChange} />
            </SidebarPanel>
            <SidebarPanel
                className="widget-modeler-config"
                key="modeler"
                heading="Settings from the Studio/Studio Pro"
                headingClassName="read-only"
            >
                <pre>
                    <code>{props.modelerCode}</code>
                </pre>
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
