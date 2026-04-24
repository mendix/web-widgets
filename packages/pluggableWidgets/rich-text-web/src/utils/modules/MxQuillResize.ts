import QuillResize from "quill-resize-module";

/**
 * Extension of QuillResize to override CSP-violating methods
 *
 * The original QuillResize.initializeEmbed() dynamically creates style elements,
 * which violates strict Content Security Policy.
 *
 * This override uses pre-defined CSS classes instead of dynamic style injection.
 */
export default class MxQuillResize extends QuillResize {
    /**
     * Override initializeEmbed to use pre-defined CSS classes instead of dynamic styles
     *
     * Original implementation:
     * - Generates random class name
     * - Creates <style> element with dynamic textContent (CSP violation)
     * - Appends to container using appendChild
     *
     * CSP-compliant implementation:
     * - Uses fixed, pre-defined class name: 'ql-resize-embed'
     * - CSS rules are defined in quill-class-attributors.scss
     * - No dynamic style injection, only adds CSS class to root element
     */
    initializeEmbed(): void {
        if (!this.options.embedTags || !this.options.embedTags.length) return;

        // Use fixed class name instead of random one
        // This class is pre-defined in quill-class-attributors.scss
        this.embedClassName = "ql-resize-embed";

        // Simply add the class to quill root - CSS is already defined
        this.quill.root.classList.add(this.embedClassName);

        // Note: The CSS rules for this class should be in quill-class-attributors.scss:
        // .ql-resize-embed img,
        // .ql-resize-embed video,
        // .ql-resize-embed iframe {
        //   pointer-events: none;
        // }
    }

    /**
     * Override handleDelete to clean up the class
     */
    handleDelete(): void {
        // Remove the class from quill root
        if (this.embedClassName) {
            this.quill.root.classList.remove(this.embedClassName);
        }

        // Call parent implementation
        super.handleDelete();
    }

    /**
     * Override destroy to clean up the class
     */
    destroy(): void {
        // Remove the class from quill root
        if (this.embedClassName) {
            this.quill.root.classList.remove(this.embedClassName);
        }

        // Call parent implementation if it exists
        if (super.destroy) {
            super.destroy();
        }
    }
}
