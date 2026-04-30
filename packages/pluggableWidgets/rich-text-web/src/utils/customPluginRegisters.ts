import { Attributor } from "parchment";
import Quill from "quill";
import { BackgroundClass, BackgroundStyle } from "quill/formats/background";
import { ColorClass, ColorStyle } from "quill/formats/color";
import { SizeClass, SizeStyle } from "quill/formats/size";
import { MxQuillModulesOptions } from "./formats";
import MxBlock from "./formats/block";
import Button from "./formats/button";
import { CustomListItem, CustomListItemClass } from "./formats/customList";
import { FontClassAttributor, FontStyleAttributor, formatCustomFonts } from "./formats/fonts";
import { FONT_SIZE_LIST } from "./formats/fontsize";
import Formula from "./formats/formula";
import CustomImage from "./formats/image";
import { IndentLeftStyle, IndentRightStyle } from "./formats/indent";
import CustomLink, { CustomLinkNoValidation } from "./formats/link";
import QuillTableBetter from "./formats/quill-table-better/quill-table-better";
import SoftBreak from "./formats/softBreak";
import CustomVideo from "./formats/video";
import { WhiteSpaceStyle } from "./formats/whiteSpace";
import { MxResizeModule } from "./modules/resize";
import MxScroll from "./modules/scroll";
import MxUploader from "./modules/uploader";
import MendixTheme from "./themes/mxTheme";
const direction = Quill.import("attributors/style/direction") as Attributor;
const alignment = Quill.import("attributors/style/align") as Attributor;
class Empty {
    doSomething(): string {
        return "";
    }
}
/**
 * Custom format registration for quill.
 */
Quill.debug("error");
Quill.register({ "themes/snow": MendixTheme }, true);
Quill.register(WhiteSpaceStyle, true);
Quill.register(CustomVideo, true);
Quill.register(CustomImage, true);
Quill.register({ "formats/softbreak": SoftBreak }, true);
Quill.register(Formula, true);
Quill.register(Button, true);
Quill.register(MxBlock, true);
Quill.register({ "modules/uploader": MxUploader }, true);
Quill.register({ "blots/scroll": MxScroll }, true);
Quill.register("modules/resize", MxResizeModule, true);
// add empty handler for view code, this format is handled by toolbar's custom config via ViewCodeDialog
Quill.register({ "ui/view-code": Empty });
Quill.register({ "modules/table-better": QuillTableBetter }, true);

export function registerCustomFormats(props: MxQuillModulesOptions): void {
    const { fonts, links, styleDataFormat } = props;

    // register formats based on styleDataFormat option
    const customFonts = formatCustomFonts(fonts);
    if (styleDataFormat === "inline") {
        const FontStyle = new FontStyleAttributor(customFonts);
        Quill.register(FontStyle, true);

        SizeStyle.whitelist = FONT_SIZE_LIST;
        Quill.register(SizeStyle, true);

        Quill.register(CustomListItem, true);
        Quill.register(IndentLeftStyle, true);
        Quill.register(IndentRightStyle, true);
        Quill.register(direction, true);
        Quill.register(alignment, true);
        Quill.register(ColorStyle, true);
        Quill.register(BackgroundStyle, true);
    } else {
        const FontClass = new FontClassAttributor(customFonts);
        Quill.register(FontClass, true);

        SizeClass.whitelist = FONT_SIZE_LIST;
        Quill.register(SizeClass, true);
        Quill.register(CustomListItemClass, true);
        Quill.register(ColorClass, true);
        Quill.register(BackgroundClass, true);
    }

    // register link format based on validation requirement
    if (links.validate) {
        Quill.register(CustomLink, true);
    } else {
        Quill.register(CustomLinkNoValidation, true);
    }
}
