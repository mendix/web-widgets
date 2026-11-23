/**
 * Upload the content with `mx.data.saveDocument` right after `create()`, without waiting for the user.
 * Verified on 11.17: `saveDocument` accepts an uncommitted created object, stores the content and commits it.
 * Off: the user uploads each file with its Upload button.
 */
export const UPLOAD_ON_CREATE = false;
