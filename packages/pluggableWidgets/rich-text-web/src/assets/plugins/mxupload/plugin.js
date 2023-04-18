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

    var element;

    for (var i = elements.length; i--; ) {
        element = elements[i];

        if (element.type == "hbox" || element.type == "vbox" || element.type == "fieldset")
            attachFileBrowser(editor, dialogName, definition, element.children);

        if (!element.filebrowser) continue;

        if (typeof element.filebrowser == "string") {
            var fb = {
                action: "QuickUpload",
                target: element.filebrowser
            };
            element.filebrowser = fb;
        }

        if (element.filebrowser.action == "QuickUpload" && element.type === "file") {
            element.onChange = function (evt) {
                const fileInput = this.getInputElement();
                var dialog = evt.sender.getDialog();
                editor._.filebrowserSe = evt.sender;

                window
                    .fetch(editor.uploadUrl, {
                        method: "POST",
                        body: fileInput.$.files[0],
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
                    .then(imagePath => setUrl(editor, dialog, imagePath));
                return false;
            };
        }
        if (element.filebrowser.action == "QuickUpload" && element["for"]) {
            element.hidden = true;
            var params = element.filebrowser.params || {};
            params.CKEditor = editor.name;
            params.CKEditorFuncNum = editor._.filebrowserFn;
            if (!params.langCode) params.langCode = editor.langCode;
            const fileInput = definition.getContents(element["for"][0]).get(element["for"][1]);
            fileInput.filebrowser = element.filebrowser;
        }
    }
}

function setUrl(editor, dialog, fileUrl) {
    var targetInput = editor._.filebrowserSe["for"];

    if (targetInput) dialog.getContentElement(targetInput[0], targetInput[1]).reset();

    if (fileUrl) updateTargetElement(fileUrl, editor._.filebrowserSe, dialog);
}

function updateTargetElement(url, sourceElement, dialog) {
    var targetElement = sourceElement.filebrowser.target || null;

    // If there is a reference to targetElement, update it.
    if (targetElement) {
        var target = targetElement.split(":");
        var element = dialog.getContentElement(target[0], target[1]);
        if (element) {
            element.setValue(url);
            dialog.selectPage(target[0]);
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
        var ids = elementId.split(";");
        for (var i = 0; i < ids.length; i++) {
            if (isConfigured(definition, tabId, ids[i])) return true;
        }
        return false;
    }

    var elementFileBrowser = definition.getContents(tabId).get(elementId).filebrowser;
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

    var definition = evt.data.definition,
        element;
    // Associate mxupload to elements with 'filebrowser' attribute.
    for (var i = 0; i < definition.contents.length; ++i) {
        if ((element = definition.contents[i])) {
            attachFileBrowser(evt.editor, evt.data.name, definition, element.elements);
            if (element.hidden && element.filebrowser)
                element.hidden = !isConfigured(definition, element.id, element.filebrowser);
        }
    }
});
