# File uploader

Upload files via drag-and-drop or file dialog. Supports multiple file uploads and image preview thumbnails.

## Overview

- **Folder**: `file-uploader-web`
- **Category**: Images, videos & files
- **Offline capable**: Yes

## XML Properties

- **Upload mode** (`uploadMode`; type: enumeration, default: files). Allowed values: `files` (Files), `images` (Images).
- **Associated files** (`associatedFiles`; type: datasource, list, default: FileUploader.FileUploadContext/FileUploader.UploadedFile_FileUploadContext/FileUploader.UploadedFile).
- **Associated images** (`associatedImages`; type: datasource, list, default: FileUploader.FileUploadContext/FileUploader.UploadedImage_FileUploadContext/FileUploader.UploadedImage).
- **Read-only mode** (`readOnlyMode`; type: boolean, default: false).
- **Action to create new files** (`createFileAction`; type: action, default: FileUploader.ACT_CreateUploadedFileDocument). Nanoflow that creates a file object, associates it to the current object and commits it.
- **Action to create new images** (`createImageAction`; type: action, default: FileUploader.ACT_CreateUploadedImageDocument). Nanoflow that creates an image object, associates it to the current object and commits it.
- **Allowed file formats** (`allowedFileFormats`; type: object, optional, list). No restrictions if left empty.
- **Configuration mode** (`configMode`; type: enumeration, default: simple). Allowed values: `simple` (Simple), `advanced` (Advanced).
- **Predefined type** (`predefinedType`; type: enumeration, default: pdfFile). Allowed values: `pdfFile` (PDF Document (.pdf)), `msWordFile` (Microsoft Word (.doc and .docx)), `msExcelFile` (Microsoft Excel (.xls and .xlsx)), `msPowerPointFile` (Microsoft PowerPoint (.ppt and .pptx)), `plainTextFile` (Plain Text (.txt)), `csvFile` (CSV (.csv)), `zipArchiveFile` (Zip archive), `anyTextFile` (Text file), `anyImageFile` (Image), `anyAudioFile` (Audio), `anyVideoFile` (Video).
- **Mime Type** (`mimeType`; type: string, optional). For example 'image/jpeg' or 'application/pdf'
- **Extensions list** (`extensions`; type: string, optional). Comma separated list of extensions. For example: '.jpg,.jpeg'.
- **Type description** (`typeFormatDescription`; type: textTemplate). Shown to the end users to describe supported file types.
- **Maximum number of files** (`maxFilesPerUpload`; type: expression, optional, default: 10). Maximum total number of files that can be associated at once. Leave empty or set to 0 for unlimited. Use this to cap the total number of attachments. Returns: Integer.
- **Maximum concurrent uploads** (`maxFilesPerBatch`; type: expression, optional). Maximum number of files uploading simultaneously. Remaining files wait in a queue and upload automatically as slots free up. Leave empty or set to 0 for unlimited. Returns: Integer.
- **Maximum file size (MB)** (`maxFileSize`; type: integer, default: 25). Reject files that are bigger than specified size.
- **Dropzone message** (`dropzoneIdleMessage`; type: textTemplate).
- **Dropzone hover for uploadable files** (`dropzoneAcceptedMessage`; type: textTemplate).
- **Dropzone hover for non uploadable files** (`dropzoneRejectedMessage`; type: textTemplate).
- **Uploading in progress** (`uploadInProgressMessage`; type: textTemplate).
- **Upload queued** (`uploadQueuedMessage`; type: textTemplate).
- **Uploading success** (`uploadSuccessMessage`; type: textTemplate).
- **Uploading unknown error** (`uploadFailureGenericMessage`; type: textTemplate).
- **Invalid file format** (`uploadFailureInvalidFileFormatMessage`; type: textTemplate).
- **File is too big** (`uploadFailureFileIsTooBigMessage`; type: textTemplate).
- **Too many files** (`uploadFailureTooManyFilesMessage`; type: textTemplate).
- **File limit reached** (`uploadLimitReachedMessage`; type: textTemplate). Shown below the dropzone when the maximum number of files is already reached.
- **Action to create new files is not available or failed** (`unavailableCreateActionMessage`; type: textTemplate).
- **Download button** (`downloadButtonTextMessage`; type: textTemplate).
- **Remove button** (`removeButtonTextMessage`; type: textTemplate).
- **Retry button** (`retryButtonTextMessage`; type: textTemplate).
- **File removal success** (`removeSuccessMessage`; type: textTemplate).
- **File removal failure** (`removeErrorMessage`; type: textTemplate).
- **Object creation timeout** (`objectCreationTimeout`; type: integer, default: 10). Consider uploads unsuccessful if the Action to create new files/images does not create new objects within the configured amount of seconds.
- **On upload success** (`onUploadSuccessFile`; type: action, data source: associatedFiles). The action to be called if file content uploaded successfully.
- **On upload success** (`onUploadSuccessImage`; type: action, data source: associatedImages). The action to be called if image content uploaded successfully.
- **On upload failure** (`onUploadFailureFile`; type: action, default: FileUploader.ACT_DeleteUploadedFileDocument, data source: associatedFiles). The action to be called if file content upload was not successful.
- **On upload failure** (`onUploadFailureImage`; type: action, default: FileUploader.ACT_DeleteUploadedImageDocument, data source: associatedImages). The action to be called if image content upload was not successful.
- **Enable custom buttons** (`enableCustomButtons`; type: boolean, default: false).
- **Custom buttons** (`customButtons`; type: object, optional, list).
- **Caption** (`buttonCaption`; type: textTemplate).
- **Icon** (`buttonIcon`; type: icon).
- **Action** (`buttonActionFile`; type: action, data source: ../associatedFiles).
- **Action** (`buttonActionImage`; type: action, data source: ../associatedImages).
- **Default file action** (`buttonIsDefault`; type: boolean, default: false). When set to Yes, the action will be triggered by clicking on the file entry.
- **Visible** (`buttonIsVisible`; type: expression, default: true). The button will be hidden when false is returned. Returns: Boolean.

## Additional Notes

## FileUploader
