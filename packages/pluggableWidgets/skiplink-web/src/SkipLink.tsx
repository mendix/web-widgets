import "./ui/SkipLink.scss";
import { useEffect } from "react";

export interface SkipLinkProps {
    /**
     * The text displayed for the skip link.
     */
    linkText: string;
    /**
     * The id of the main content element to jump to.
     */
    mainContentId: string;
}

/**
 * Inserts a skip link as the first child of the element with ID 'root'.
 * When activated, focus is programmatically set to the main content.
 */
export function SkipLink({ linkText, mainContentId }: SkipLinkProps): null {
    useEffect(() => {
        // Create the skip link element
        const link = document.createElement("a");
        link.href = `#${mainContentId}`;
        link.className = "skip-link";
        link.textContent = linkText;
        link.tabIndex = 0;

        // Handler to move focus to the main content
        function handleClick(event: MouseEvent) {
            event.preventDefault();
            const main = document.getElementById(mainContentId);
            if (main) {
                // Store previous tabindex
                const prevTabIndex = main.getAttribute("tabindex");
                // Ensure main is focusable
                if (!main.hasAttribute("tabindex")) {
                    main.setAttribute("tabindex", "-1");
                }
                main.focus();
                // Clean up tabindex if it was not present before
                if (prevTabIndex === null) {
                    main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
                }
            }
        }

        link.addEventListener("click", handleClick);

        // Insert as the first child of the element with ID 'root'
        const root = document.getElementById("root");
        if (root) {
            root.insertBefore(link, root.firstChild);
        }

        // Cleanup on unmount
        return () => {
            link.removeEventListener("click", handleClick);
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        };
    }, [linkText, mainContentId]);

    // This component does not render anything in the React tree
    return null;
}
