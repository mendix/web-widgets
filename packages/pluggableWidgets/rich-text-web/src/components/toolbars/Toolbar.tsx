import { ReactElement, ReactNode, useState, useEffect } from "react";
import { useCurrentEditor } from "../EditorContext";
import { CodeViewToolbarButton } from "./components/CodeView";
import { ColorPickerToolbarButton } from "./components/ColorPicker";
import { DialogToolbarButton } from "./components/Dialog";
import { TableGridToolbarButton } from "./components/TableGrid";
import { ToolbarButton } from "./components/ToolbarButton";
import {
    TOOLBAR_GROUPS,
    SECONDARY_TOOLBAR_GROUP,
    ToolbarContext,
    DropdownCommand,
    ToolbarGroupConfig,
    ToolbarButtonConfig
} from "./ToolbarConfig";
import "./Toolbar.scss";
// eslint-disable-next-line import/order
import { ToolbarDropdown } from "./components/ToolbarDropdown";

interface ToolbarProps {
    imageSourceContent?: ReactNode;
}

interface ToolbarGroupProps extends ToolbarProps {
    toolbar: ToolbarGroupConfig;
}

interface ToolbarRowProps extends ToolbarProps {
    toolbars: ToolbarGroupConfig[];
}

interface ToolbarButtonFactoryProps extends ToolbarProps {
    button: ToolbarButtonConfig;
}

function ToolbarButtonFactory(props: ToolbarButtonFactoryProps): ReactElement {
    const { button, imageSourceContent } = props;
    const { editor } = useCurrentEditor();
    if (!editor) {
        return <></>;
    }
    switch (button.action) {
        case "colorPicker":
            return <ColorPickerToolbarButton key={button.name} config={button} />;
        case "dialog":
            return <DialogToolbarButton key={button.name} config={button} imageSourceContent={imageSourceContent} />;
        case "tableGrid":
            return <TableGridToolbarButton key={button.name} config={button} />;
        case "codeView":
            return <CodeViewToolbarButton key={button.name} config={button} />;
        case "dropdown":
            return <ToolbarDropdown key={button.name} config={button} />;
        default:
            return <ToolbarButton key={button.name} config={button} />;
    }
}

function ToolbarGroup(props: ToolbarGroupProps): ReactElement | null {
    const { toolbar, ...rest } = props;
    const { editor } = useCurrentEditor();
    const [, setSelectionUpdate] = useState(0);

    // Force re-render when editor selection changes
    useEffect(() => {
        if (!editor || !toolbar.showWhen) return;

        const handleSelectionUpdate = (): void => {
            setSelectionUpdate(prev => prev + 1);
        };

        editor.on("selectionUpdate", handleSelectionUpdate);

        return () => {
            editor.off("selectionUpdate", handleSelectionUpdate);
        };
    }, [editor, toolbar.showWhen]);
    if (toolbar.showWhen && !toolbar.showWhen(editor)) {
        return null;
    }
    return (
        <div key={toolbar.name} className="toolbar-group">
            {toolbar.buttons.map(button => (
                <ToolbarButtonFactory key={button.name} button={button} {...rest} />
            ))}
        </div>
    );
}

function ToolbarRow(props: ToolbarRowProps): ReactElement {
    return (
        <div className="toolbar-row">
            {props.toolbars.map(group => (
                <ToolbarGroup key={group.name} toolbar={group} {...props} />
            ))}
        </div>
    );
}

export default function Toolbar(props: ToolbarProps): ReactElement | null {
    const { editor } = useCurrentEditor();
    const [activeDropdown, setActiveDropdown] = useState<DropdownCommand | null>(null);

    if (!editor) {
        return null;
    }

    const handleDropdownToggle = (dropdownType: DropdownCommand | null): void => {
        setActiveDropdown(prev => (prev === dropdownType ? null : dropdownType));
    };

    const handleDropdownClose = (): void => {
        setActiveDropdown(null);
    };

    return (
        <ToolbarContext.Provider value={{ activeDropdown, handleDropdownToggle, handleDropdownClose }}>
            <div className="tiptap-toolbar">
                <ToolbarRow toolbars={TOOLBAR_GROUPS} {...props} />
                <ToolbarRow toolbars={SECONDARY_TOOLBAR_GROUP} {...props} />
            </div>
        </ToolbarContext.Provider>
    );
}
