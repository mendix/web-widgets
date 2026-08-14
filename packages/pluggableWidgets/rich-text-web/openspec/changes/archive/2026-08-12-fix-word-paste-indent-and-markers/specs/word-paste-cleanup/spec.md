## ADDED Requirements

### Requirement: Word-sourced paste is detected and sanitized

Pasted HTML SHALL be recognised as Microsoft Word output when it contains any Word marker — an `mso-` prefixed CSS declaration, a `MsoNormal`/`MsoListParagraph` class, an office namespace URI (`urn:schemas-microsoft-com:office:*`), a Word `Generator`/`ProgId` meta tag, or an `mso` conditional comment. Only Word-detected HTML SHALL be sanitized; all other pasted content SHALL pass through unchanged.

#### Scenario: Word HTML is sanitized

- **WHEN** HTML containing `mso-list:l0 level1 lfo1` is pasted
- **THEN** the sanitizer runs and the resulting document contains no `mso-` declarations

#### Scenario: Non-Word HTML passes through

- **WHEN** HTML with no Word markers is pasted
- **THEN** the sanitizer makes no modification to it

#### Scenario: Plain text paste is untouched

- **WHEN** the clipboard carries only `text/plain`
- **THEN** the sanitizer does not run

#### Scenario: Copy and paste within the editor is untouched

- **WHEN** content copied from this editor is pasted back into it
- **THEN** the sanitizer does not run and the content round-trips unchanged

### Requirement: Word markup residue is removed

The sanitizer SHALL remove Word-only markup that has no meaning in the editor: all `mso-*` CSS declarations, `tab-stops` declarations, office-namespace elements (`o:p`, `w:*`), Word conditional-comment nodes, `<xml>` blocks, Word's `<style>` block, and `Mso*` class names. An element left with no meaningful attributes after stripping SHALL be unwrapped rather than kept as an empty wrapper.

#### Scenario: mso declarations stripped

- **WHEN** a pasted element carries `style='mso-fareast-font-family:Arial;mso-bidi-font-family:Arial'`
- **THEN** the resulting element has no `style` attribute
- **AND** because it is a `span` with no other attributes, it is unwrapped entirely

#### Scenario: Empty spans do not survive

- **WHEN** Word HTML contains `<span style='mso-bidi-font-family:Arial'>SCOPE OF ESTIMATE</span>`
- **THEN** the output contains the text `SCOPE OF ESTIMATE` with no wrapping `<span>`

#### Scenario: Office namespace elements removed

- **WHEN** Word HTML contains `<o:p></o:p>`
- **THEN** the element is removed from the output

#### Scenario: Non-mso declarations are preserved

- **WHEN** a pasted element carries `style='color:red;mso-bidi-font-family:Arial'`
- **THEN** the output retains `color: red`
- **AND** the `mso-bidi-font-family` declaration is gone
- **AND** the `span` is kept because it still carries a meaningful style

#### Scenario: tab-stops removed

- **WHEN** a pasted block carries `tab-stops:list 26.1pt left .5in`
- **THEN** the declaration is absent from the output

### Requirement: Word's hanging-indent `text-indent` is removed

The sanitizer SHALL remove `text-indent` from Word blocks along with `margin-left`. Word's `text-indent` on a list block is the negative half of a hanging indent whose only purpose is to position the list marker against a tab stop; once the marker is preserved as inline text that mechanism no longer applies, and a surviving negative `text-indent` would offset the first line of real text instead.

#### Scenario: Negative text-indent dropped

- **WHEN** a pasted block carries `margin-left:36.0pt; text-indent:-18.0pt`
- **THEN** the output block carries no `text-indent` declaration
- **AND** its indent level is derived from `margin-left` alone

#### Scenario: First line is not offset

- **WHEN** a Word list block with a hanging indent is pasted
- **THEN** the block's first line starts at the same horizontal position as its wrapped lines

### Requirement: Word list markers are preserved as plain text

The visible number or bullet Word emits inside `span[style*="mso-list:Ignore"]` SHALL be preserved as plain text within its block, and the span SHALL be unwrapped. The nested tab-filler span (a small-point-size run of non-breaking spaces) SHALL be removed and replaced by a single space. This applies uniformly to every block type, headings and paragraphs alike; no list element SHALL be created.

#### Scenario: Numbered heading from Word

- **WHEN** the Word heading `<h1 style='margin-left:26.1pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><![endif]><span>SCOPE OF ESTIMATE</span></h1>` is pasted
- **THEN** the result is a single `<h1>` at indent level 1 whose text is `2. SCOPE OF ESTIMATE`
- **AND** the heading level `h1` is preserved
- **AND** no `<ol>` or `<li>` is created
- **AND** no 7pt font span and no run of non-breaking spaces remain

#### Scenario: Numbered paragraph from Word

- **WHEN** a Word paragraph carrying `mso-list` with marker text `3.` is pasted
- **THEN** the result is a `<p>` whose text begins `3. ` followed by the paragraph text
- **AND** no `<ol>` or `<li>` is created

#### Scenario: Tab filler collapses to one space

- **WHEN** a Word marker contains five non-breaking spaces in a 7pt span
- **THEN** exactly one ordinary space separates the marker from the block text

#### Scenario: Ordered marker text kept verbatim

- **WHEN** the marker text is `a.`, `iv)`, or `12.`
- **THEN** it appears in the output exactly as written

#### Scenario: Pasted numbers are static

- **WHEN** a Word numbered block is pasted and the user then presses Enter at the end of it
- **THEN** no new number is generated (the marker is text, not list numbering)

### Requirement: Word symbol-font bullet markers become real characters

When a marker is not an ordered marker and its font-family is one of Word's bullet-hack fonts, the sanitizer SHALL substitute the intended character so the bullet does not render as a literal letter or symbol: `·` in Symbol becomes `•` (U+2022), `o` in Courier New becomes `◦` (U+25E6), `§` in Wingdings becomes `▪` (U+25AA). Any other marker SHALL be kept verbatim.

The substituted character SHALL NOT inherit the bullet-hack font. Where Word wraps the marker in an enclosing element whose only content is that marker, the sanitizer SHALL discard the wrapper together with the marker rather than leaving the replacement inside it. A wrapper that also contains real content SHALL be left in place.

#### Scenario: Symbol font bullet

- **WHEN** a Word bullet marker is `·` with font-family Symbol
- **THEN** the output text is `•`

#### Scenario: Courier New hollow bullet

- **WHEN** a Word bullet marker is `o` with font-family Courier New
- **THEN** the output text is `◦`, not the letter `o`

#### Scenario: Wingdings square bullet

- **WHEN** a Word bullet marker is `§` with font-family Wingdings
- **THEN** the output text is `▪`, not the section sign

#### Scenario: Bullet font wrapper does not survive the marker

- **WHEN** a Word bullet arrives as `<span style='font-family:Symbol'><span style='mso-list:Ignore'>·</span></span>`
- **THEN** neither `span` remains in the output
- **AND** the resulting `•` is not styled with the Symbol font

#### Scenario: Unrecognised marker kept verbatim

- **WHEN** a marker is neither an ordered pattern nor a known symbol-font bullet
- **THEN** its text is kept unchanged

### Requirement: Indent level is taken from Word's own level metadata

When a Word block carries `mso-list`, the sanitizer SHALL take the indent level from the `levelN` token in that declaration rather than measuring `margin-left`, and SHALL emit it as `data-indent="N"` clamped to the configured range.

#### Scenario: Level 1

- **WHEN** a block carries `mso-list:l0 level1 lfo1`
- **THEN** the output block carries `data-indent="1"`

#### Scenario: Nested levels stay uniform

- **WHEN** consecutive blocks carry `level1`, `level2`, `level3`
- **THEN** the output blocks carry `data-indent` of `1`, `2`, `3` respectively
- **AND** the level steps are uniform, with no depth skipped or duplicated

#### Scenario: Level metadata wins over margin-left

- **WHEN** a block carries both `margin-left:26.1pt` and `mso-list:l0 level1 lfo1`
- **THEN** the level is `1` (from the metadata)
- **AND** the source `margin-left` is removed from the block

#### Scenario: Level above the maximum is clamped

- **WHEN** a block carries `level9` and `maxIndent` is smaller than 9
- **THEN** `data-indent` equals `maxIndent`

### Requirement: Indent level is inferred from the fragment when level metadata is absent

For a Word block with a `margin-left` but no `mso-list`, the sanitizer SHALL derive the level relative to the pasted fragment: collect all `margin-left` values in the fragment, cluster them with a tolerance that absorbs Word's jitter, take the smallest cluster above a minimum threshold as the fragment's indent step, and compute `level = round(value / step)`. Values below the minimum threshold SHALL map to level 0.

#### Scenario: Uniform levels from a consistent step

- **WHEN** a fragment's blocks carry `margin-left` of `36pt`, `72pt`, and `108pt` with no `mso-list`
- **THEN** their levels are `1`, `2`, and `3`

#### Scenario: Jittered values cluster together

- **WHEN** two blocks carry `26.1pt` and `26.05pt`
- **THEN** both resolve to the same level

#### Scenario: A single indented block

- **WHEN** a fragment contains exactly one indented block at `36pt`
- **THEN** its level is `1`

#### Scenario: Below-threshold margin does not indent

- **WHEN** the only `margin-left` in the fragment is very small (e.g. `2pt`)
- **THEN** its level is `0` and it is not treated as the fragment's indent step

### Requirement: The sanitizer is independent of the configured style mode

The sanitizer SHALL emit indent as `data-indent` only, and SHALL NOT need to know the widget's `styleDataFormat`. Indentation from a Word paste SHALL survive in both `inline` and `class` modes.

#### Scenario: Inline mode

- **WHEN** Word content at level 1 is pasted with `styleDataFormat: "inline"`
- **THEN** the block renders `margin-left: 2em`

#### Scenario: Class mode

- **WHEN** the same content is pasted with `styleDataFormat: "class"`
- **THEN** the block renders `data-indent="1"` and class `indent-1`
- **AND** the indentation is not lost

### Requirement: Sanitized Word output is idempotent

Pasting content that has already been sanitized SHALL produce the same result again. Sanitized output SHALL contain no Word markers, so a second pass SHALL be a no-op.

#### Scenario: Re-paste of sanitized output

- **WHEN** sanitized output is copied and pasted again
- **THEN** it is not detected as Word HTML
- **AND** the content is unchanged
