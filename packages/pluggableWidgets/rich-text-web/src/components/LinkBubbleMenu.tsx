import { BubbleMenu } from "@tiptap/react/menus";
import { ReactElement, useState } from "react";
import { useCurrentEditor } from "./EditorContext";
import { useT } from "../utils/i18n";
import { LinkDialog } from "./toolbars/components/LinkDialog";
import { ToolbarDefaultButton } from "./toolbars/components/ToolbarDefaultButton";
import "./LinkBubbleMenu.scss";

/**
 * Contextual bubble menu shown on links. Offers in-place Edit (opens the link
 * dialog prefilled) and Remove (strips the link mark across its full range).
 */
export function LinkBubbleMenu(): ReactElement | null {
    const { editor } = useCurrentEditor();
    const t = useT();
    const [isEditing, setIsEditing] = useState(false);
    const [linkEl, setLinkEl] = useState<HTMLElement | null>(null);

    if (!editor) {
        return null;
    }

    // Resolve the anchor element for the currently active link so the dialog can
    // stay positioned even after the bubble menu hides on focus loss.
    const resolveLinkEl = (): HTMLElement | null => {
        const { from, to } = editor.state.selection;
        // Sample a position strictly inside the link so domAtPos lands on the link's
        // text node rather than the paragraph boundary (which would walk out of the link).
        const pos = from < to ? from + 1 : from;
        const domAt = editor.view.domAtPos(pos);
        // For an element node, the real child sits at childNodes[offset].
        let node: Node | null =
            domAt.node.nodeType === Node.ELEMENT_NODE
                ? (domAt.node.childNodes[domAt.offset] ?? domAt.node)
                : domAt.node;
        if (node && node.nodeType !== Node.ELEMENT_NODE) {
            node = node.parentElement;
        }
        const element = node as HTMLElement | null;
        return element?.closest<HTMLElement>("a, .tiptap-link") ?? null;
    };

    const removeLink = (): void => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
    };

    const openEdit = (): void => {
        editor.chain().focus().extendMarkRange("link").run();
        setLinkEl(resolveLinkEl());
        setIsEditing(true);
    };

    const closeEdit = (): void => {
        setIsEditing(false);
        setLinkEl(null);
    };

    return (
        <>
            <BubbleMenu
                editor={editor}
                pluginKey="linkBubbleMenu"
                shouldShow={({ editor }) => editor.isEditable && editor.isActive("link") && !isEditing}
            >
                <div className="link-bubble-menu">
                    <ToolbarDefaultButton icon="Hyperlink" onClick={openEdit} title={t("link.editLink")} />
                    <ToolbarDefaultButton icon="Erase" onClick={removeLink} title={t("link.removeLink")} />
                </div>
            </BubbleMenu>
            {isEditing && <LinkDialog referenceElement={linkEl} onClose={closeEdit} />}
        </>
    );
}
