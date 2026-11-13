/**
 * Text keys mapped to their parameter tuple. Every widget declares its own map so that a
 * View author sees every available text in autocompletion and a wrong parameter count
 * fails to compile.
 */
export type TextMap = Record<string, readonly unknown[]>;

export type Translate<Texts extends TextMap> = <K extends keyof Texts>(key: K, ...params: Texts[K]) => string;

export type WidgetStatus = "loading" | "ready" | "unavailable";

/**
 * The envelope every widget ViewModel starts with: the fields every pluggable widget fills, and
 * nothing else. Widget-specific state and commands extend it; input widgets add
 * `InputViewModel`. Nothing in a ViewModel may mention a behaviour library, a positioning
 * library, Atlas, or class names. The Studio Pro "Class" and "Style" system properties are not
 * here: a widget with the Label system property never receives them (the client puts them on its
 * form-group wrapper), a widget without it adds them to its own ViewModel.
 * See docs/design/headless-widgets.md, section 7.
 */
export interface WidgetViewModel<Hints = object, Texts extends TextMap = TextMap> {
    /** The widget id. A View puts it on the element the Studio Pro label targets. */
    id: string;
    status: WidgetStatus;
    /** Advisory, Atlas-presentation properties from Studio Pro. A custom View may ignore them. */
    hints: Hints;
    /** Every user-facing and ARIA text. */
    t: Translate<Texts>;
    /** Studio Pro "Tab index" system property. */
    tabIndex?: number;
}

export interface InputA11y {
    label?: string;
    required: boolean;
    /** Id of the validation message element while there is one, for `aria-describedby`. */
    describedBy?: string;
}

/**
 * The facet of an input widget: Studio Pro's own bundle of read-only state, validation feedback,
 * the required flag and label, and the on-enter and on-leave events. An input whose XML has no
 * enter or leave action exposes the two commands as commands that run nothing.
 */
export interface InputViewModel {
    readOnly: boolean;
    validation?: string;
    a11y: InputA11y;
    /** The widget received focus from outside: runs the "On enter" action. */
    enter(): void;
    /** Focus left the widget: runs the "On leave" action. */
    leave(): void;
}
