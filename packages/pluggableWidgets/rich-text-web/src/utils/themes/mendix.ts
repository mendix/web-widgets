import Quill from "quill";

import SnowTheme from "quill/themes/snow";

class MendixTheme extends SnowTheme {
    buildPickers(selects: NodeListOf<HTMLSelectElement>, icons: Record<string, string | Record<string, string>>): void {
        super.buildPickers(selects, icons);
    }
}

Quill.register({ "themes/snow": MendixTheme }, true);
