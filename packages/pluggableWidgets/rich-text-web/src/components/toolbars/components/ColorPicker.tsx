import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import Compact from "@uiw/react-color-compact";
import { ReactElement, useState, useEffect, useRef, useContext } from "react";
import "./ColorPicker.scss";
import { useCurrentEditor } from "../../EditorContext";
import { colorPickerHelpers } from "../helpers/colorPickerHelpers";
import { ColorPickerCommand, ToolbarButtonConfig, ToolbarContext, ToolbarContextType } from "../ToolbarConfig";

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

    const { x, y, strategy, refs } = useFloating({
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate
    });

    // Set reference element
    if (referenceElement && refs.reference.current !== referenceElement) {
        refs.setReference(referenceElement);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (refs.floating.current && !refs.floating.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose, refs.floating]);

    const handleColorChange = (newColor: { hex: string }): void => {
        setColor(newColor.hex);
        onColorChange(newColor.hex);
    };

    return (
        <div
            ref={refs.setFloating}
            className="color-picker-dropdown"
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0
            }}
        >
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
