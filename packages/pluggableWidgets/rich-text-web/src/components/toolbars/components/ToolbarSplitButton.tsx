import { ReactElement, useState, useRef, useEffect, KeyboardEvent } from "react";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { getIconForOrderedListStyle, OrderedListStyle } from "../helpers/listHelpers";
import { useDropdown } from "../hooks/useDropdown";
import { ToolbarButtonConfig, ToolbarDropdownOption } from "../ToolbarConfig";
import { ToolbarDefaultButton } from "./ToolbarDefaultButton";

// Module-level sticky state for last-used ordered list style
let lastOrderedListStyle: OrderedListStyle = "decimal";

interface ToolbarSplitButtonProps {
    config: ToolbarButtonConfig;
}

type FocusedPart = "main" | "dropdown";

export function ToolbarSplitButton({ config }: ToolbarSplitButtonProps): ReactElement {
    const { editor } = useCurrentEditor();
    const t = useT();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [, setUpdateTrigger] = useState(0);
    const mainButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownButtonRef = useRef<HTMLButtonElement>(null);

    const { refs, floatingStyles } = useDropdown({
        isOpen: isDropdownOpen,
        onClose: () => setIsDropdownOpen(false),
        referenceElement: dropdownButtonRef.current
    });

    // Force re-render when editor selection or content changes
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = (): void => {
            setUpdateTrigger(prev => prev + 1);
        };

        editor.on("selectionUpdate", handleUpdate);
        editor.on("transaction", handleUpdate);

        return () => {
            editor.off("selectionUpdate", handleUpdate);
            editor.off("transaction", handleUpdate);
        };
    }, [editor]);

    if (!editor) {
        return <></>;
    }

    const isActive = config.isActive ? config.isActive(editor) : false;

    // Get current icon based on active state or sticky state
    const getCurrentIcon = (): string => {
        if (editor.isActive("orderedList")) {
            const attrs = editor.getAttributes("orderedList");
            const style = (attrs.listStyleType || "decimal") as OrderedListStyle;
            return getIconForOrderedListStyle(style);
        }
        return getIconForOrderedListStyle(lastOrderedListStyle);
    };

    const currentIcon = getCurrentIcon();
    const currentValue = config.getCurrentValue ? config.getCurrentValue(editor) : "";

    // Main button click handler
    const handleMainClick = (): void => {
        if (!editor) return;

        if (isActive) {
            // Toggle off
            editor.chain().focus().toggleOrderedList().run();
        } else {
            // Toggle on with sticky style
            const styleType = lastOrderedListStyle === "decimal" ? null : lastOrderedListStyle;
            editor
                .chain()
                .focus()
                .toggleOrderedList()
                .updateAttributes("orderedList", { listStyleType: styleType })
                .run();
        }
    };

    // Dropdown button click handler
    const handleDropdownClick = (): void => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Dropdown option selection handler
    const handleOptionSelect = (option: ToolbarDropdownOption): void => {
        if (!editor) return;

        // Update sticky state
        const styleValue = option.value as OrderedListStyle;
        // eslint-disable-next-line react-hooks/globals
        lastOrderedListStyle = styleValue;

        const styleType = styleValue === "decimal" ? null : styleValue;

        if (isActive) {
            // Just change style
            editor.chain().focus().updateAttributes("orderedList", { listStyleType: styleType }).run();
        } else {
            // Enable OL + apply style
            editor
                .chain()
                .focus()
                .toggleOrderedList()
                .updateAttributes("orderedList", { listStyleType: styleType })
                .run();
        }

        setIsDropdownOpen(false);
    };

    // Keyboard navigation handler
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, part: FocusedPart): void => {
        switch (e.key) {
            case "ArrowRight":
                if (part === "main") {
                    e.preventDefault();
                    dropdownButtonRef.current?.focus();
                }
                break;
            case "ArrowLeft":
                if (part === "dropdown") {
                    e.preventDefault();
                    mainButtonRef.current?.focus();
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                setIsDropdownOpen(true);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (part === "main") {
                    handleMainClick();
                } else {
                    handleDropdownClick();
                }
                break;
        }
    };

    return (
        <div className={`split-button ${isActive ? "is-active" : ""}`} role="group" aria-label={t(config.title)}>
            <ToolbarDefaultButton
                ref={mainButtonRef}
                onClick={handleMainClick}
                onKeyDown={e => handleKeyDown(e, "main")}
                className="split-button-main icon-button"
                aria-label={`${t(config.title)} - Toggle`}
                aria-pressed={isActive}
            >
                <span className={`icons icon-${currentIcon}`} />
            </ToolbarDefaultButton>

            <ToolbarDefaultButton
                ref={dropdownButtonRef}
                onClick={handleDropdownClick}
                onKeyDown={e => handleKeyDown(e, "dropdown")}
                className="split-button-dropdown"
                aria-label={`${t(config.title)} - Style options`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
            >
                <span className="icons icon-Arrow-down dropdown-arrow" />
            </ToolbarDefaultButton>

            {isDropdownOpen && (
                <div ref={refs.setFloating} style={floatingStyles} className="toolbar-dropdown-menu" role="menu">
                    {config.dropdownOptions?.map(option => (
                        <ToolbarDefaultButton
                            key={option.value}
                            onClick={() => handleOptionSelect(option)}
                            className="toolbar-dropdown-item"
                            isActive={currentValue === option.value}
                            role="menuitem"
                        >
                            {option.icon && <span className={`icons icon-${option.icon}`} />}
                            <span>{t(option.label)}</span>
                        </ToolbarDefaultButton>
                    ))}
                </div>
            )}
        </div>
    );
}
