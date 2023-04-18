// Traverse through the content definition and attach filebrowser to
// elements with 'filebrowser' attribute.
//
// @param String
//            dialogName Dialog name.
// @param {CKEDITOR.dialog.definitionObject}
//            definition Dialog definition.
// @param {Array}
//            elements Array of {@link CKEDITOR.dialog.definition.content}
//            objects.
function attachFileBrowser(editor, dialogName, definition, elements) {
    if (!elements || !elements.length) return;

    let element;

    for (let i = elements.length; i--; ) {
        element = elements[i];

        if (element.type == "hbox" || element.type == "vbox" || element.type == "fieldset")
            attachFileBrowser(editor, dialogName, definition, element.children);

        if (!element.filebrowser) continue;

        if (typeof element.filebrowser == "string") {
            const fb = {
                action: "QuickUpload",
                target: element.filebrowser
            };
            element.filebrowser = fb;
        }

        if (element.filebrowser.action == "QuickUpload" && element.type === "file") {
            element.onChange = function (evt) {
                const fileInput = this.getInputElement();
                const file = fileInput.$.files[0];
                if (file.size > editor.uploadImageMaxSize * 1024) {
                    alert(`Image is too large. Select an image less than ${editor.uploadImageMaxSize} KB`);
                    return;
                }

                const dialog = evt.sender.getDialog();
                editor._.filebrowserSe = evt.sender;

                window
                    .fetch(editor.uploadImageEndpoint, {
                        method: "POST",
                        body: file,
                        headers: {
                            Origin: window.location.origin,
                            "Content-Type": "text/html",
                            "x-csrf-token": window.mx ? window.mx.session.getConfig("csrftoken") : ""
                        }
                    })
                    .then(response => {
                        if (!response.ok || response.status >= 400) {
                            throw Error(
                                JSON.stringify({
                                    status: response.status,
                                    statusText: response.statusText,
                                    ok: response.ok,
                                    body: response.body
                                })
                            );
                        }
                        return response.text();
                    })
                    .then(imagePath => setUrl(editor, dialog, imagePath, file.name));
                return false;
            };
        }
        if (element.filebrowser.action == "QuickUpload" && element["for"]) {
            element.hidden = true;
            const params = element.filebrowser.params || {};
            params.CKEditor = editor.name;
            params.CKEditorFuncNum = editor._.filebrowserFn;
            if (!params.langCode) params.langCode = editor.langCode;
            const fileInput = definition.getContents(element["for"][0]).get(element["for"][1]);
            fileInput.filebrowser = element.filebrowser;
        }
    }
}

function setUrl(editor, dialog, fileUrl, imageName) {
    const targetInput = editor._.filebrowserSe["for"];

    if (targetInput) dialog.getContentElement(targetInput[0], targetInput[1]).reset();

    if (fileUrl) updateTargetElement(fileUrl, editor._.filebrowserSe, dialog, imageName);
}

function updateTargetElement(url, sourceElement, dialog, imageName) {
    const targetElement = sourceElement.filebrowser.target || null;

    // If there is a reference to targetElement, update it.
    if (targetElement) {
        const target = targetElement.split(":");
        const element = dialog.getContentElement(target[0], target[1]);
        if (element) {
            element.setValue(url);
            dialog.selectPage(target[0]);
        }
        const altElement = dialog.getContentElement(target[0], "txtAlt");
        if (altElement) {
            altElement.setValue(imageName);
        }
    }
}

// Returns true if filebrowser is configured in one of the elements.
//
// @param {CKEDITOR.dialog.definitionObject}
//            definition Dialog definition.
// @param String
//            tabId The tab id where element(s) can be found.
// @param String
//            elementId The element id (or ids, separated with a semicolon) to check.
function isConfigured(definition, tabId, elementId) {
    if (elementId.indexOf(";") !== -1) {
        const ids = elementId.split(";");
        for (let i = 0; i < ids.length; i++) {
            if (isConfigured(definition, tabId, ids[i])) return true;
        }
        return false;
    }

    const elementFileBrowser = definition.getContents(tabId).get(elementId).filebrowser;
    return !!elementFileBrowser;
}

CKEDITOR.plugins.add("mxupload", {
    init: function (editor) {
        editor._.filebrowserFn = CKEDITOR.tools.addFunction(setUrl, editor);
        editor.on("destroy", function () {
            CKEDITOR.tools.removeFunction(this._.filebrowserFn);
        });
    }
});

CKEDITOR.on("dialogDefinition", function (evt) {
    if (!evt.editor.plugins.mxupload) return;

    let definition = evt.data.definition,
        element;
    // Associate mxupload to elements with 'filebrowser' attribute.
    for (let i = 0; i < definition.contents.length; ++i) {
        if ((element = definition.contents[i])) {
            attachFileBrowser(evt.editor, evt.data.name, definition, element.elements);
            if (element.hidden && element.filebrowser)
                element.hidden = !isConfigured(definition, element.id, element.filebrowser);
        }
    }
});
