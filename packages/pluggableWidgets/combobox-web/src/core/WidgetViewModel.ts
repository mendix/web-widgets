import { CSSProperties } from "react";

/**
 * Text keys mapped to their parameter tuple. Every widget declares its own map so that a
 * View author sees every available text in autocompletion and a wrong parameter count
 * fails to compile.
 */
export type TextMap = Record<string, readonly unknown[]>;

export type Translate<Texts extends TextMap> = <K extends keyof Texts>(key: K, ...params: Texts[K]) => string;

export type WidgetStatus = "loading" | "ready" | "unavailable";

export interface WidgetA11y {
    label?: string;
    required: boolean;
    describedBy?: string;
    statusMessage?: string;
}

/**
 * The envelope every widget ViewModel starts with. Widget-specific state and commands extend
 * it. Nothing in a ViewModel may mention a behaviour library, a positioning library, Atlas, or
 * class names. See docs/design/headless-widgets.md, section 7.
 */
export interface WidgetViewModel<Hints = object, Texts extends TextMap = TextMap> {
    id: string;
    status: WidgetStatus;
    readOnly: boolean;
    validation?: string;
    a11y: WidgetA11y;
    /** Advisory, Atlas-presentation properties from Studio Pro. A custom View may ignore them. */
    hints: Hints;
    /** Every user-facing and ARIA text. */
    t: Translate<Texts>;
    /** Studio Pro "Tab index" system property. */
    tabIndex?: number;
    /** Studio Pro "Class" system property. */
    className?: string;
    /** Studio Pro "Style" system property. */
    style?: CSSProperties;
}
