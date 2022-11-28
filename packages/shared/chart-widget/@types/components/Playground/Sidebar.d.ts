import { ReactElement, ReactNode } from "react";
import "../../ui/Sidebar.scss";
import "../../ui/Panel.scss";
interface SidebarProps {
    children: ReactNode;
    className?: string;
    isOpen: boolean;
    onBlur?: () => void;
    onClick?: () => void;
}
export declare const Sidebar: ({ className, isOpen, onBlur, onClick, children }: SidebarProps) => ReactElement;
export interface SidebarHeaderProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    onClose?: () => void;
}
export declare const SidebarHeader: ({ className, onClose, children }: SidebarHeaderProps) => ReactElement;
export interface SidebarPanelProps {
    className?: string;
    heading?: string;
    headingClassName?: string;
    children: ReactNode;
}
export declare const SidebarPanel: ({
    className,
    heading,
    headingClassName,
    children
}: SidebarPanelProps) => ReactElement;
export interface SidebarHeaderToolsProps {
    className?: string;
    children: ReactNode;
}
export declare const SidebarHeaderTools: ({ className, children }: SidebarHeaderToolsProps) => ReactElement;
export interface SelectProps {
    onChange: (value: string) => void;
    options: SelectOption[];
}
interface SelectOption {
    name: string;
    value: string | number;
    isDefaultSelected: boolean;
}
export declare const Select: ({ onChange, options }: SelectProps) => ReactElement;
export {};
//# sourceMappingURL=Sidebar.d.ts.map
