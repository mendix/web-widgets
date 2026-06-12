## ADDED Requirements

### Requirement: Standard font glyphs render correctly in PDFs

The Document Viewer SHALL correctly render PDF glyphs that depend on PDF standard fonts (ZapfDingbats, Symbol, etc.) by fetching font resources using absolute URLs resolvable by the PDF.js worker.

#### Scenario: ZapfDingbats checkmark renders in cross-origin worker context

- **WHEN** a PDF contains a glyph drawn from the ZapfDingbats standard font (e.g. a checkmark drawn via a Form XObject)
- **AND** the PDF.js worker is loaded from a cross-origin URL (e.g. unpkg CDN)
- **THEN** the glyph SHALL render visibly on the canvas

#### Scenario: Font fetch uses absolute URL

- **WHEN** PDF.js requests a standard font file from the worker thread
- **THEN** the request URL SHALL be an absolute URL including the application origin (e.g. `https://example.com/widgets/.../FoxitDingbats.pfb`)

#### Scenario: PDFs without standard fonts are unaffected

- **WHEN** a PDF contains no glyphs requiring standard font substitution
- **THEN** rendering SHALL be identical to previous behavior
