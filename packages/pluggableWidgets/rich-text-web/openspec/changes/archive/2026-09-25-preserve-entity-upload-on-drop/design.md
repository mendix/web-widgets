## Context

Rich Text already opens the image dialog for dropped and pasted image files, but the current implementation stops after switching the dialog to the Media Library tab. In version 4.12.0, the same flow forwarded pending files into the embedded File Uploader so the entity-upload path stayed active. The current package keeps the dialog ownership and `imageSourceContent` slot, but treats that slot as declarative React content rather than as an imperative upload target.

## Goals / Non-Goals

**Goals:**

- Preserve the existing dialog-based entry point for dropped and pasted images.
- Restore the entity-upload handoff when `imageSource` is configured.
- Keep the default base64 upload flow unchanged when no image source is available.
- Preserve the current tab visibility rules and dialog presentation behavior.

**Non-Goals:**

- Redesign toolbar ownership or dialog presentation.
- Change the public XML/API shape of the rich text widget.
- Alter validation rules, sizing rules, or image insertion semantics outside the upload-path decision.

## Decisions

- Keep the current dialog ownership model and use the existing `initialFiles` path in the image dialog rather than moving the logic back into the toolbar.
    - Rationale: the toolbar already opens the dialog correctly and handles placement/focus; moving the upload decision there would reintroduce duplicate ownership and widen the change.
    - Alternative considered: restore a toolbar-level file bridge. Rejected because it would spread upload behavior across more components without improving the actual handoff.

- Prefer entity upload when `imageSource` is configured, and only fall back to base64 conversion when no entity source is available.
    - Rationale: this matches the 4.12.0 behavior users rely on and preserves the existing default-upload path for apps that do not configure an entity source.
    - Alternative considered: continue converting dropped files to base64 and later map them to entity upload. Rejected because it loses the existing File Uploader contract and does not match the observed legacy behavior.

- Keep the handoff local to the image dialog and inspect the rendered entity tab for the embedded file input after the tab is active.
    - Rationale: the dialog already owns `imageSourceContent` rendering, so it is the narrowest place to complete the file transfer.
    - Alternative considered: add new public callbacks or refs to `imageSourceContent`. Rejected because it would change the API surface and force downstream widgets to adopt a new contract.

## Risks / Trade-offs

- [Risk] The implementation depends on the embedded uploader exposing a real file input in its rendered DOM. → Mitigation: keep the selector narrow, assert it in tests, and preserve the base64 fallback for the non-entity path.
- [Risk] The file handoff may race with tab activation or portal mounting. → Mitigation: trigger the handoff only after the entity tab is active and the dialog node is available.
- [Risk] A future change to the embedded uploader's markup could break the DOM bridge. → Mitigation: keep the interaction isolated to one effect and cover it with regression tests that model the current File Uploader contract.

## Migration Plan

No migration is required. The change is limited to runtime behavior in the rich-text widget.

## Open Questions

- Should the embedded File Uploader expose a more explicit hook for file injection in the future, or is the current DOM contract sufficient for this widget?
