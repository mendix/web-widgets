import { useEffect, useRef } from "react";
import "./ui/SkipLink.scss";
import { SkipLinkContainerProps } from 'typings/SkipLinkProps';

/**
 * Inserts a skip link as the first child of the element with ID 'root'.
 * When activated, focus is programmatically set to the main content.
 */
export function SkipLink(props: SkipLinkContainerProps) {
    const skipLinkRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        // Insert as the first child of the element with ID 'root'
        const root = document.getElementById("root");
        if (root && skipLinkRef.current) {
            root.insertBefore(skipLinkRef.current, root.firstChild);
        }
    }, [skipLinkRef.current]);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        event.preventDefault();
        let main: HTMLElement;
        const mainByID = document.getElementById(props.mainContentId);
        if (props.mainContentId !== "" && mainByID !== null) {
            main = mainByID;
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
            console.error("Could not find a main element on page and no mainContentId specified in widget properties.")
        }
    }

    return <a 
            ref={skipLinkRef}
            className={`skip-link ${props.class}`} 
            href={`#${props.mainContentId}`} 
            tabIndex={props.tabIndex}
            onClick={handleClick}>
            {props.linkText}
        </a>;
}
