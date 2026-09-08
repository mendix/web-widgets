# Accordion

Toggle the display of sections of content.

## Overview

- **Folder**: `accordion-web`
- **Category**: Structure
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/accordion)

## XML Properties

### General

- **Enable advanced options** (`advancedMode`; type: boolean, default: false).
- **Groups** (`groups`; type: object, required, list).
- **Header** (`headerRenderMode`; type: enumeration, default: text). Allowed values: `text` (Text), `custom` (Custom).
- **Text** (`headerText`; type: textTemplate).
- **Render mode** (`headerHeading`; type: enumeration, default: headingThree). Allowed values: `headingOne` (Heading 1), `headingTwo` (Heading 2), `headingThree` (Heading 3), `headingFour` (Heading 4), `headingFive` (Heading 5), `headingSix` (Heading 6).
- **Header** (`headerContent`; type: widgets, optional).
- **Content** (`content`; type: widgets, optional).
- **Visible** (`visible`; type: expression, default: true). Returns: Boolean.
- **Dynamic class** (`dynamicClass`; type: expression, optional). Returns: String.
- **Load content** (`loadContent`; type: enumeration, default: always). This property determines when the widgets should be rendered and data is fetched. The “Always” option will always load the widgets regardless whether the group is expanded. The “When expanded” option can reduce the initial (page) load time, but will increase the load time when expanding the group. Allowed values: `always` (Always), `whenExpanded` (When expanded).
- **Start as** (`initialCollapsedState`; type: enumeration, default: collapsed). Allowed values: `expanded` (Expanded), `collapsed` (Collapsed), `dynamic` (Dynamic).
- **Start as collapsed** (`initiallyCollapsed`; type: expression, default: true). Returns: Boolean.
- **Collapsed** (`collapsed`; type: attribute, optional). Determines whether the group is collapsed or expanded. The 'Start as' properties override the attribute value for the initial state. Attribute types: Boolean.
- **On change** (`onToggleCollapsed`; type: action, optional). Executes an action when the 'Collapsed' attribute value changes. Note: the 'Start as' properties can prevent execution of this action when the initial state changes.

### Behavior

- **Collapsible** (`collapsible`; type: boolean, default: true).
- **Expanded groups** (`expandBehavior`; type: enumeration, default: singleExpanded). Allow a single group or multiple groups to be expanded at the same time. Allowed values: `singleExpanded` (Single), `multipleExpanded` (Multiple).
- **Animate** (`animate`; type: boolean, default: true).

### Icon

- **Show icon** (`showIcon`; type: enumeration, default: right). Allowed values: `right` (Right), `left` (Left), `no` (No).
- **Icon** (`icon`; type: icon, optional).
- **Expand icon** (`expandIcon`; type: icon, optional).
- **Collapse icon** (`collapseIcon`; type: icon, optional).
- **Animate icon** (`animateIcon`; type: boolean, default: true). Animate the icon when the group is collapsing or expanding.
