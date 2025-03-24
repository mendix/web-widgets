export type EditorAction = { type: string; value: boolean };

export interface EditorState {
    isFullscreen: boolean;
}

export const initialState: EditorState = {
    isFullscreen: false
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "SET_FULLSCREEN":
            if (action.value === undefined || action.value === null) {
                return { ...state, isFullscreen: !state.isFullscreen };
            } else {
                return { ...state, isFullscreen: action.value };
            }

        default:
            return state;
    }
}
