import { MouseEvent, useState } from "react";
import { createPortal } from "react-dom";
import "./ui/SkipLink.scss";
import { SkipLinkContainerProps } from "typings/SkipLinkProps";

/**
 * Inserts a skip link as the first child of the element with ID 'root'.
 * When activated, focus is programmatically set to the main content.
 */
export function SkipLink(props: SkipLinkContainerProps) {
    const [linkRoot] = useState(() => {
        const link = document.createElement("div");
        const root = document.getElementById("root");
        // Insert as first child immediately
        if (root && root.firstElementChild) {
            root.insertBefore(link, root.firstElementChild);
        } else if (root) {
            root.appendChild(link);
        } else {
            console.error("No root element found on page");
        }
        return link;
    });

    function handleClick(event: MouseEvent): void {
        event.preventDefault();
        let main: HTMLElement;
        if (props.mainContentId !== "") {
            const mainByID = document.getElementById(props.mainContentId);
            if (mainByID !== null) {
                main = mainByID;
            } else {
                console.error(`Element with id: ${props.mainContentId} not found on page`);
                return;
            }
        } else {
            main = document.getElementsByTagName("main")[0];
        }

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
        } else {
            console.error("Could not find a main element on page and no mainContentId specified in widget properties.");
        }
    }

    return createPortal(
        <a
            className={`widget-skip-link ${props.class}`}
            href={`#${props.mainContentId}`}
            tabIndex={props.tabIndex}
            onClick={handleClick}
        >
            {props.linkText}
        </a>,
        linkRoot
    );
}
