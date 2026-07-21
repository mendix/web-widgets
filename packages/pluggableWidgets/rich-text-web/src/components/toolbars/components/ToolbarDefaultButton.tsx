import classNames from "classnames";
import { ButtonHTMLAttributes, forwardRef, ReactElement } from "react";
import { useCurrentEditor } from "../../EditorContext";

export interface ToolbarDefaultButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: string;
    activeIcon?: string;
    isActive?: boolean;
    /** When true, the button stays enabled while the editor is in code view (used by the code view toggle). */
    allowInCodeView?: boolean;
}

/**
 * Shared toolbar button. Renders the `<button>` element used by every rich text
 * toolbar control. Defaults to an icon `<span>` child, composes the `icon-button`
 * base class (overridable via `className`), and forwards its ref so floating
 * dropdowns and pickers can anchor to it.
 */
export const ToolbarDefaultButton = forwardRef<HTMLButtonElement, ToolbarDefaultButtonProps>(
    function ToolbarDefaultButton(
        { icon, activeIcon, isActive, allowInCodeView, className, type, disabled, children, ...rest },
        ref
    ): ReactElement {
        const currentIcon = isActive && activeIcon ? activeIcon : icon;
        const { codeViewState } = useCurrentEditor();

        const lockedByCodeView = !allowInCodeView && codeViewState.isCodeView === true;

        return (
            <button
                {...rest}
                ref={ref}
                type={type ?? "button"}
                disabled={disabled || lockedByCodeView}
                className={classNames(className || "icon-button", { "is-active": isActive })}
            >
                {children ?? <span className={`icons icon-${currentIcon}`} />}
            </button>
        );
    }
);
