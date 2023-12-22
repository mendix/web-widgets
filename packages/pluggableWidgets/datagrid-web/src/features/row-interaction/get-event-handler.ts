type SelectHandler = "select";
type ExecHandler = "execAction";
export type Handler = SelectHandler | ExecHandler | "none";
export type Target = "cell" | "checkbox";
export type InputEvent = "click" | "dblclick" | "shift+click" | "shift+space" | "keyup{enter}" | "keyup{space}";
export type Selection = "rowClick" | "checkbox" | "none";
export type ActionType = "single" | "double" | "none";
type MatchFn = (event: InputEvent, selection: Selection, action: ActionType) => Handler;

const checkboxEvents = new Set<InputEvent>(["click", "shift+click", "shift+space", "keyup{space}"]);

const cellRules: Record<InputEvent, (selection: Selection, action: ActionType) => Handler> = {
    click: (selection, action) => {
        if (selection === "rowClick") {
            return "select";
        }
        return action === "single" ? "execAction" : "none";
    },
    "shift+click": (selection, action) => {
        if (selection === "rowClick") {
            return "select";
        }
        return action === "single" ? "execAction" : "none";
    },
    "shift+space": selection => (selection !== "none" ? "select" : "none"),
    dblclick: (_, action) => (action === "double" ? "execAction" : "none"),
    "keyup{enter}": (_, action) => (action !== "none" ? "execAction" : "none"),
    "keyup{space}": (_, action) => (action !== "none" ? "execAction" : "none")
};

const targets: Record<Target, MatchFn> = {
    cell(event, selection, action) {
        return cellRules[event](selection, action);
    },
    checkbox(event, selection) {
        if (selection === "checkbox" && checkboxEvents.has(event)) {
            return "select";
        }
        return "none";
    }
};

export function getEventHandler(target: Target, event: InputEvent, selection: Selection, action: ActionType): Handler {
    return targets[target](event, selection, action);
}
