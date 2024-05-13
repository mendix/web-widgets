// override this for premium plugin support
export const API_KEY = undefined;

function getBaseUrl(): string {
    const base_url = document.getElementsByTagName("base");
    return base_url && base_url.length > 0 ? base_url[0]?.href : "";
}
const PLUGINS =
    "accordion advlist anchor autolink charmap code codesample directionality emoticons fullscreen image help importcss insertdatetime link lists media nonbreaking pagebreak preview quickbars searchreplace table visualblocks visualchars wordcount";

export const DEFAULT_CONFIG = {
    width: "100%",
    promotion: false,
    branding: false,
    skin: "oxide",
    body_class: "widget-rich-text",
    base_url: API_KEY !== undefined ? undefined : `${getBaseUrl()}widgets/com/mendix/widget/custom/richtext`,
    plugins: PLUGINS,
    font_size_formats: "8px 10px 12px 14px 18px 24px 36px",
    menu: {
        file: { title: "File", items: "newdocument restoredraft | preview | export print | deleteallconversations" },
        edit: { title: "Edit", items: "undo redo | cut copy paste pastetext | selectall | searchreplace" },
        view: {
            title: "View",
            items: "code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments"
        },
        insert: {
            title: "Insert",
            items: "image link media addcomment pageembed codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime"
        },
        format: {
            title: "Format",
            items: "bold italic underline strikethrough superscript subscript codeformat | blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat"
        },
        tools: { title: "Tools", items: "spellchecker spellcheckerlanguage | a11ycheck code wordcount" },
        table: { title: "Table", items: "inserttable | cell row column | advtablesort | tableprops deletetable" }
    }
};
