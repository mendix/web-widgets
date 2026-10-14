import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useRef, useContext } from "react";
import "./ColorPicker.scss";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { colorPickerHelpers } from "../helpers/colorPickerHelpers";
import { useDropdown } from "../hooks/useDropdown";
import { ColorPickerCommand, ToolbarButtonConfig, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";

export interface ColorPickerProps {
    defaultColor?: string;
    onColorChange: (color: string) => void;
    onColorClear?: () => void;
    onClose: () => void;
    referenceElement: HTMLElement | null;
}

export function ColorPicker({
    defaultColor = "#000000",
    onColorChange,
    onColorClear,
    onClose,
    referenceElement
}: ColorPickerProps): ReactElement {
    const [color, setColor] = useState(defaultColor);
    const t = useT();

    const { refs, floatingStyles } = useDropdown({
        isOpen: true,
        onClose,
        referenceElement
    });

    const handleColorChange = (newColor: { hex: string }): void => {
        setColor(newColor.hex);
        onColorChange(newColor.hex);
    };

    const handleClear = (): void => {
        onColorClear?.();
        onClose();
    };

    const clearLabel = t("colorPicker.clear");

    return (
        <div ref={refs.setFloating} className="color-picker-dropdown" style={floatingStyles}>
            <Compact
                color={color}
                onChange={handleColorChange}
                addonAfter={
                    onColorClear ? (
                        <button
                            type="button"
                            className="color-picker-clear"
                            title={clearLabel}
                            aria-label={clearLabel}
                            onClick={handleClear}
                        >
                            ✕
                        </button>
                    ) : undefined
                }
            />
        </div>
    );
}

export function ColorPickerToolbarButton({ config }: { config: ToolbarButtonConfig }): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { editor } = useCurrentEditor();
    const t = useT();
    const { activeDropdown, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const pickerType = config.command as ColorPickerCommand;
    const isPickerOpen = activeDropdown === pickerType;

    return (
        <div style={{ position: "relative" }}>
            <ToolbarDefaultButton
                ref={buttonRef}
                onClick={() => handleDropdownToggle(pickerType)}
                icon={config.icon}
                title={t(config.title)}
            />
            {isPickerOpen && editor && (
                <ColorPicker
                    defaultColor={colorPickerHelpers.getDefaultColor(pickerType)}
                    onColorChange={color => colorPickerHelpers.handleColorChange(editor, pickerType, color)}
                    onColorClear={() => colorPickerHelpers.handleColorClear(editor, pickerType)}
                    onClose={handleDropdownClose}
                    referenceElement={buttonRef.current}
                />
            )}
        </div>
    );
}
