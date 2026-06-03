import { ReactElement, ReactNode, useState, useEffect, useMemo } from "react";
import { useCurrentEditor } from "../EditorContext";
import { CodeViewToolbarButton } from "./components/CodeView";
import { ColorPickerToolbarButton } from "./components/ColorPicker";
import { ConfigurationDropdown } from "./components/ConfigurationDropdown";
import { DialogToolbarButton } from "./components/Dialog";
import { TableGridToolbarButton } from "./components/TableGrid";
import { ToolbarButton } from "./components/ToolbarButton";
import {
    SECONDARY_TOOLBAR_GROUP,
    ToolbarContext,
    DropdownCommand,
    ToolbarGroupConfig,
    ToolbarButtonConfig,
    getFilteredToolbarGroups,
    ToolbarGroupsConfig
} from "./ToolbarConfig";
import { PresetEnum, ToolbarConfigEnum, AdvancedConfigType, CustomFontsType } from "../../../typings/RichTextProps";
import "./Toolbar.scss";
// eslint-disable-next-line import/order
import { ToolbarDropdown } from "./components/ToolbarDropdown";

interface ToolbarProps {
    imageSourceContent?: ReactNode;
    preset?: PresetEnum;
    toolbarConfig?: ToolbarConfigEnum;
    toolbarGroups?: ToolbarGroupsConfig;
    advancedConfig?: AdvancedConfigType[];
    customFonts?: CustomFontsType[];
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
        case "configurationDropdown": {
            // Create configuration sections dynamically using customAction
            const result = button.customAction ? button.customAction(editor) : [];
            const sections = Array.isArray(result) ? result : [];
            const configButton = { ...button, configurationSections: sections };
            return <ConfigurationDropdown key={button.name} config={configButton} />;
        }
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
    const { preset = "basic", toolbarConfig, toolbarGroups, advancedConfig, imageSourceContent, customFonts } = props;
    const { editor } = useCurrentEditor();
    const [activeDropdown, setActiveDropdown] = useState<DropdownCommand | null>(null);

    // Filter toolbar groups based on preset and custom configuration
    const filteredGroups = useMemo(
        () => getFilteredToolbarGroups(preset, toolbarConfig, toolbarGroups, advancedConfig, customFonts),
        [preset, toolbarConfig, toolbarGroups, advancedConfig, customFonts]
    );

    const filteredSecondaryGroups = useMemo(
        () =>
            SECONDARY_TOOLBAR_GROUP.filter(group =>
                filteredGroups.some(filteredGroup => filteredGroup.name === group.parentName)
            ),
        [filteredGroups]
    );

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
                <ToolbarRow toolbars={filteredGroups} imageSourceContent={imageSourceContent} />
                <ToolbarRow toolbars={filteredSecondaryGroups} imageSourceContent={imageSourceContent} />
            </div>
        </ToolbarContext.Provider>
    );
}
