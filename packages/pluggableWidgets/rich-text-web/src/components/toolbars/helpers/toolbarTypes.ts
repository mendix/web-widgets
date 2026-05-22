import { Editor } from "@tiptap/react";
import { ReactNode } from "react";
import { ToolbarButtonConfig } from "../ToolbarConfig";

// ============================================================================
// Toolbar Button Component Props
// ============================================================================

/**
 * Props for toolbar button components that render a single button
 */
export interface BaseToolbarButtonProps {
    config: ToolbarButtonConfig;
}

/**
 * Props for toolbar button components that support image source content
 * (used for dialog buttons that need to display Mendix entity selectors)
 */
export interface DialogToolbarButtonProps extends BaseToolbarButtonProps {
    imageSourceContent?: ReactNode;
}

// ============================================================================
// Dialog Component Props
// ============================================================================

/**
 * Base props for all dialog components
 */
export interface BaseDialogProps {
    onClose: () => void;
    referenceElement: HTMLElement | null;
}

/**
 * Props for ColorPicker component
 */
export interface ColorPickerProps extends BaseDialogProps {
    defaultColor?: string;
    onColorChange: (color: string) => void;
}

/**
 * Props for ImageDialog component
 */
export interface ImageDialogProps {
    onClose: () => void;
    referenceElement: HTMLElement | null;
    imageSourceContent?: ReactNode;
}

/**
 * Props for LinkDialog component
 */
export interface LinkDialogProps {
    onClose: () => void;
    referenceElement: HTMLElement | null;
}

/**
 * Props for VideoDialog component
 */
export interface VideoDialogProps {
    onClose: () => void;
    referenceElement: HTMLElement | null;
}

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Props for TableGridSelector component
 */
export interface TableGridSelectorProps {
    editor: Editor;
    onClose: () => void;
}

// ============================================================================
// Image-related Types
// ============================================================================

/**
 * Entity image data from Mendix database
 */
export interface EntityImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
}

/**
 * Image source modes for ImageDialog
 */
export type ImageSourceMode = "url" | "upload" | "entity";

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum file size for image uploads (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Maximum table dimensions for TableGridSelector
 */
export const MAX_TABLE_ROWS = 10;
export const MAX_TABLE_COLS = 10;
