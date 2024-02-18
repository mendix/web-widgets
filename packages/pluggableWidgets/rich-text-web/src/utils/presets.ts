import { PresetEnum } from "typings/RichTextProps";

interface EditorConfig {
    toolbar: string;
}

export function createPreset(type: PresetEnum, defaultValue?: EditorConfig): EditorConfig {
    switch (type) {
        case "basic":
            return {
                toolbar: "bold italic | bullist numlist | outdent indent | link | removeformat | help"
            };
        case "standard":
            return {
                toolbar:
                    "undo redo | bold italic strikethrough | removeformat | bullist numlist | blockquote | outdent indent | ltr rtl | alignleft aligncenter alignright alignjustify | fontfamily fontsize forecolor backcolor | image link media | blocks anchor | cut copy paste pastetext | codesample preview code | selectall fullscreen | help"
            };
        case "full":
            return {
                toolbar:
                    "undo redo | bold italic underline strikethrough | superscript subscript | removeformat | bullist numlist | blockquote | outdent indent | ltr rtl | alignleft aligncenter alignright alignjustify | fontfamily fontsize forecolor backcolor | image link media | blocks anchor | cut copy paste pastetext | codesample preview code | emoticons insertdatetime searchreplace | selectall fullscreen | help"
            };
        case "custom":
            return (
                defaultValue ?? {
                    toolbar:
                        "undo redo | bold italic forecolor | removeformat | bullist numlist | outdent indent | alignleft aligncenter alignright alignjustify | image link media | blocks anchor | codesample preview code | help"
                }
            );
        default:
            return {
                toolbar:
                    "undo redo | bold italic forecolor | removeformat | bullist numlist | outdent indent | alignleft aligncenter alignright alignjustify | image link media | blocks | codesample preview code | help"
            };
    }
}
