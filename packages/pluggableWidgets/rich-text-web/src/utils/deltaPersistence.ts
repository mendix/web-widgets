export interface SerializableQuill {
    getSemanticHTML(): string;
    getContents(): unknown;
}

export interface EditorPersistenceSnapshot {
    html: string;
    deltaJson?: string;
}

export function serializeQuillDelta(quill: SerializableQuill | null | undefined): string {
    if (!quill) {
        return JSON.stringify({ ops: [] });
    }

    return JSON.stringify(quill.getContents());
}

export function getEditorPersistenceSnapshot(
    quill: SerializableQuill | null | undefined,
    enableDelta: boolean
): EditorPersistenceSnapshot {
    const html = quill?.getSemanticHTML() ?? "";

    if (!enableDelta) {
        return { html };
    }

    return {
        html,
        deltaJson: serializeQuillDelta(quill)
    };
}
