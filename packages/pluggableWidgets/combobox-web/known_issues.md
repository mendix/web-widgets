# Known issues

Layout issues of the Combo box that exist on `main` as of version 2.10.0. They were found while fixing WC-3664 (a long selected value widening an Auto-fill column) and are not caused or fixed by that change.

Each issue was reproduced in the combobox test project (Mendix 11.15.0, Atlas Core 4.5.0, React client, 1280×720 viewport) with the widget built from `main` and from the WC-3664 branch; both builds behave the same. Measurements are in CSS pixels.

Background shared by most issues: since 2.7.0 the selected value (the caption) is laid out in the normal flow with `white-space: nowrap`, so the combobox's natural width follows the width of its current text. Parents that size themselves to their content (Auto-fit layout grid columns, flex containers that center their children, inline or absolutely positioned containers) therefore size the combobox to its current value.

## 1. Horizontal labels cut the value short in parents that size to their content

**Scenario:** a combobox with a horizontal label (the label next to the field) inside a parent that sizes to its content, such as an Auto-fit layout grid column or a container with `display: flex; flex-direction: column; align-items: center`.

**What is broken:** the parent is sized to the label text plus the field, but the horizontal label then takes a fixed 25% of that width. The field ends up a few pixels narrower than its value, and the value is cut off with an ellipsis even though the parent was sized to fit it. With "Medium caption value" in an Auto-fit column, 150px is shown of 157px. Which of the two loses space can vary: in one run the label was cut ("Center…") and the value shown in full, in another the value was cut and the label shown in full.

**Why it is an issue:** an Auto-fit column is chosen to show its content in full, and here it never does. The result can also differ between page loads, which makes screenshots of such pages unstable.

**Blast radius:** apps that combine horizontal labels with Auto-fit columns or centered flex layouts. Every combobox in such a place shows a truncated value, short values included; the loss is small (a few characters) but always visible as an ellipsis.

## 2. A very long value in an Auto-fit column squeezes the neighbouring columns

**Scenario:** a combobox in an Auto-fit layout grid column, next to an Auto-fill column, with a selected value wider than most of the row (about 140 characters in the test).

**What is broken:** the Auto-fit column grows to the full width of the value (1016px in a 1180px row) and the Auto-fill neighbour is squeezed down to its minimum width (148px). The value is not truncated. With a value wider than the whole row the neighbour wraps onto a new line instead (seen in a headless browser comparison with the compiled Atlas CSS; in 2.6.2 the same combobox was 246px wide and truncated its value).

**Why it is an issue:** the width of a form column depends on the data the user selected, not on the page design. A long value can squeeze or push away the other fields of the row, and the layout changes when the selection changes.

**Blast radius:** forms that put comboboxes with long option captions (enumerations, association captions, descriptions) in Auto-fit columns. Rows with several fields are affected the most.

## 3. An Auto-fit column grows as soon as the user starts typing

**Scenario:** a combobox with filtering enabled in an Auto-fit layout grid column.

**What is broken:** while the value is shown, the column is as wide as the value (222px for "Medium caption value"). After the first typed character the caption is hidden and the text input takes over with its built-in width of about 20 characters, and the column grows to 336px. In 2.6.2 the width did not change, because the caption did not set the width.

**Why it is an issue:** the field and every element next to it in the row jump sideways on the first keystroke, while the user is typing. Layout shifts during input are distracting and can move a click target that the user is about to hit.

**Blast radius:** every filterable combobox in an Auto-fit column, or in another parent that sizes to its content. Filtering is on by default.

## 4. The field sticks out of parents narrower than 15 characters

**Scenario:** a combobox in a parent narrower than about 132px (15 characters plus padding), for example a narrow column or a container with a fixed small width.

**What is broken:** since 2.8.2 the field has a minimum width of 15 characters (added to stop it collapsing in centered flex containers). In a 100px parent the field is 132px wide and sticks out 32px on the right, over whatever is next to it. The down arrow and clear button are part of the overflowing area.

The same minimum applies at phone widths. At a 320px viewport, a layout grid row with three Auto-fill comboboxes keeps its three columns side by side at 191px each (573px in total), so the row is wider than the screen. The columns are not stacked, and the fields do not shrink below their minimum. On `main` the same row is wider still, because the long value also widens its column (WC-3664).

**Why it is an issue:** the field overlaps neighbouring content or is clipped, and on phones the form does not fit the screen. Content that requires horizontal scrolling at 320px wide fails WCAG 2.2 success criterion 1.4.10 (Reflow); the same happens on desktop at 400% zoom.

**Blast radius:** comboboxes in narrow columns (for example several Auto-fill columns in a sidebar or a dialog), and every page with several comboboxes side by side that is used on phones or at high zoom.

## 5. Clearing or changing the value resizes an Auto-fit column

**Scenario:** a combobox in an Auto-fit layout grid column, with the clear button enabled or a selection that changes.

**What is broken:** the column follows the width of the current text. Clearing "Medium caption value" shrinks the column from 222px to 132px (the minimum width, because the empty text is shorter); selecting a longer or shorter value resizes it again. In 2.6.2 the width did not depend on the length of the value (a short and a medium value both gave a 280px column); only the clear button appearing or disappearing changed it slightly.

**Why it is an issue:** the row reflows on every selection change, and the fields next to the combobox move. A user who clears a value and wants to click the neighbouring field finds it at a different place.

**Blast radius:** every combobox in an Auto-fit column, or in another parent that sizes to its content, whose values differ in length or that can be cleared.

## 6. Custom content that does not wrap widens its Auto-fill column

**Scenario:** a single select combobox with custom content (Custom content set to Yes) whose content does not wrap, for example text with `white-space: nowrap`, a long word or a fixed-width element, in an Auto-fill layout grid column.

**What is broken:** the custom content sets the minimum width of the combobox, and Auto-fill columns cannot shrink below it. With a long option caption rendered without wrapping, the column is 605px wide while its two Auto-fill neighbours are 272px. This is the same problem as WC-3664, for custom content: the WC-3664 fix covers the text value of single and multi select, and leaves custom content unchanged.

**Why it is an issue:** the page design (equal Auto-fill columns) depends on the selected data, as it did for text values before WC-3664.

**Blast radius:** comboboxes with custom content in Auto-fill columns, in layouts whose custom content does not wrap. Custom content that wraps (plain text without `nowrap`) is not affected.
