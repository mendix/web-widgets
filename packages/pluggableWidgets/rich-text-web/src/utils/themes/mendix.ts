import SnowTheme from "quill/themes/snow";

export default class MendixTheme extends SnowTheme {
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);
    }
}
