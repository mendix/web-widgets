import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useRef, useContext } from "react";
import "./ColorPicker.scss";
import { useCurrentEditor } from "../../EditorContext";
import { colorPickerHelpers } from "../helpers/colorPickerHelpers";
import { ColorPickerCommand, ToolbarButtonConfig, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";
import { useDropdown } from "../hooks/useDropdown";

export interface ColorPickerProps {
    defaultColor?: string;
    onColorChange: (color: string) => void;
    onClose: () => void;
    referenceElement: HTMLElement | null;
}

export function ColorPicker({
    defaultColor = "#000000",
    onColorChange,
    onClose,
    referenceElement
}: ColorPickerProps): ReactElement {
    const [color, setColor] = useState(defaultColor);

    const { refs, floatingStyles } = useDropdown({
        isOpen: true,
        onClose,
        referenceElement
    });

    const handleColorChange = (newColor: { hex: string }): void => {
        setColor(newColor.hex);
        onColorChange(newColor.hex);
    };

    return (
        <div ref={refs.setFloating} className="color-picker-dropdown" style={floatingStyles}>
            <Compact color={color} onChange={handleColorChange} />
        </div>
    );
}

export function ColorPickerToolbarButton({ config }: { config: ToolbarButtonConfig }): ReactElement {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { editor } = useCurrentEditor();
    const { activeDropdown, handleDropdownToggle, handleDropdownClose } = useContext(
        ToolbarContext
    ) as ToolbarContextType;
    const pickerType = config.command as ColorPickerCommand;
    const isPickerOpen = activeDropdown === pickerType;

    return (
        <div style={{ position: "relative" }}>
            <button
                ref={buttonRef}
                onClick={() => handleDropdownToggle(pickerType)}
                className="icon-button"
                title={config.title}
            >
                <span className={`icons icon-${config.icon}`} />
            </button>
            {isPickerOpen && editor && (
                <ColorPicker
                    defaultColor={colorPickerHelpers.getDefaultColor(pickerType)}
                    onColorChange={color => colorPickerHelpers.handleColorChange(editor, pickerType, color)}
                    onClose={handleDropdownClose}
                    referenceElement={buttonRef.current}
                />
            )}
        </div>
    );
}
