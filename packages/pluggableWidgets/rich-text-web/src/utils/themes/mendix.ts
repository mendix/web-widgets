import SnowTheme from "quill/themes/snow";

/**
 * Override quill's current theme.
 */
export default class MendixTheme extends SnowTheme {
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);
    }
}
