import { MouseEvent, useState, ReactElement, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ValueStatus } from "mendix";
import "../ui/SkipLink.scss";
import { SkipLinkContainerProps } from "../../typings/SkipLinkProps";

/**
 * Inserts a skip link as the first child of the element with ID 'root'.
 * When activated, focus is programmatically set to the main content.
 */
export function SkipLinkComponent(props: SkipLinkContainerProps): ReactElement {
    const { skipToPrefix, linkText, mainContentId, tabIndex, listContentId, class: className } = props;
    const [linkRoot] = useState(() => document.createElement("div"));
    const mainLinkText = useMemo(() => `${skipToPrefix} ${linkText}`, [skipToPrefix, linkText]);

    useEffect(() => {
        const root = document.getElementById("root");
        // Insert as first child immediately
        if (root && root.firstElementChild) {
            root.insertBefore(linkRoot, root.firstElementChild);
        } else if (root) {
            root.appendChild(linkRoot);
        } else {
            console.error("No root element found on page");
        }
        return () => {
            linkRoot.remove();
        };
    }, [linkRoot]);

    function handleClick(event: MouseEvent, contentId?: string): void {
        event.preventDefault();
        let main: HTMLElement;
        const targetId = contentId || mainContentId;

        if (targetId !== "") {
            const mainByID = document.getElementById(targetId);
            if (mainByID !== null) {
                main = mainByID;
            } else {
                console.error(`Element with id: ${targetId} not found on page`);
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
        <div className="widget-skip-link-container">
            <a
                className={`widget-skip-link ${className}`}
                href={`#${mainContentId}`}
                tabIndex={tabIndex}
                onClick={e => handleClick(e)}
            >
                {mainLinkText}
            </a>
            {listContentId
                .filter(item => item.contentIdInList.status === ValueStatus.Available && item.contentIdInList.value)
                .map((item, index) => {
                    const contentId = item.contentIdInList.value!;
                    const linkText = `${skipToPrefix} ${item.LinkTextInList}`;
                    return (
                        <a
                            key={`${contentId}_${index}`}
                            className={`widget-skip-link ${props.class}`}
                            href={`#${contentId}`}
                            tabIndex={tabIndex}
                            onClick={e => handleClick(e, contentId)}
                        >
                            {linkText}
                        </a>
                    );
                })}
        </div>,
        linkRoot
    );
}
