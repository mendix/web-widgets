import { ValueStatus } from "mendix";
import { ReactElement, useMemo, useRef } from "react";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";

import { Accordion as AccordionComponent, AccordionGroups } from "./components/Accordion";
import { Header } from "./components/Header";
import { useIconGenerator } from "./utils/iconGenerator";

import { AccordionContainerProps, GroupsType } from "../typings/AccordionProps";

export function Accordion(props: AccordionContainerProps): ReactElement | null {
    const id = useRef(generateUUID());
    // Only the initial collapsed state blocks rendering: it is needed to compute the initial state.
    // The controlled "collapsed" state may briefly go to "loading" while a microflow runs; blocking on
    // it would unmount and remount all group content.
    const isLoading = props.groups.find(
        group => group.initialCollapsedState === "dynamic" && group.initiallyCollapsed.status === "loading"
    );

    const groups: AccordionGroups | undefined = useMemo(() => translateGroups(props.groups), [props.groups]);

    const generateIcon = useIconGenerator(
        props.animateIcon,
        { data: props.icon?.value, loading: props.icon?.status === ValueStatus.Loading },
        { data: props.expandIcon?.value, loading: props.expandIcon?.status === ValueStatus.Loading },
        { data: props.collapseIcon?.value, loading: props.collapseIcon?.status === ValueStatus.Loading }
    );

    if (!groups || isLoading) {
        return null;
    }

    return (
        <AccordionComponent
            id={`Accordion${id.current}`}
            class={props.class}
            style={props.style}
            tabIndex={props.tabIndex}
            groups={groups}
            collapsible={props.collapsible}
            animateContent={props.animate}
            singleExpandedGroup={props.collapsible ? props.expandBehavior === "singleExpanded" : undefined}
            generateHeaderIcon={generateIcon}
            showGroupHeaderIcon={props.showIcon}
        />
    );
}

function translateGroups(groups: AccordionContainerProps["groups"]): AccordionGroups | undefined {
    if (someGroupMissingData(groups)) {
        return undefined;
    }

    return groups.map(group => {
        let header = group.headerContent;

        if (group.headerRenderMode === "text") {
            header = <Header heading={group.headerHeading}>{group.headerText.value}</Header>;
        }

        return {
            header,
            content: group.content,
            collapsed: group.collapsed?.value,
            initiallyCollapsed:
                group.initialCollapsedState === "dynamic"
                    ? group.initiallyCollapsed.value
                    : group.initialCollapsedState === "collapsed",
            visible: group.visible.value!,
            dynamicClassName: group.dynamicClass?.value,
            onToggleCompletion: group.collapsed?.setValue,
            loadContent: group.loadContent
        };
    });
}

function someGroupMissingData(groups: GroupsType[]): boolean {
    // "collapsed" is deliberately not checked: an undefined value is treated as "no new value yet" by the
    // state management, so the last known value is kept instead of unmounting the group content.
    return groups.some(
        group =>
            group.visible.value === undefined ||
            group.headerText.value === undefined ||
            group.initiallyCollapsed.value === undefined
    );
}
