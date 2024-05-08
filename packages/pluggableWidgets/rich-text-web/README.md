Please see [Rich Text](https://docs.mendix.com/appstore/widgets/rich-text) in the Mendix documentation for details.

## Extending and code alteration guide for premium plugin usage:

-   Fork or clone this repository to create your own implementation
-   Run `pnpm install`
-   Read more detail on how to run your forked widget from this [readme](/README.md)

### Get your API Key

-   Create an account on [TinyMCE](https://www.tiny.cloud/) and get your API Key
-   Add the api key to `src/utils/constants.ts` on `API_KEY` constant value.

```
export const API_KEY= 'your-api-key'
```

### Clear local TinyMCE declarations

To get premium features working, you need to use TinyMCE cloud instead of bundled version.
To do this, you will need:

-   Clear the content of `src/utils/plugins.ts` as this is no longer needed and will be import directly from TinyMCE cloud script.

### Insert tiny mce cloud script

Include your TinyMCE cloud script on the page.

```
<script src="https://cdn.tiny.cloud/1/your-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
```

### Insert the premium plugins

Follow the instruction on [TinyMCE plugin](https://www.tiny.cloud/docs/tinymce/latest/plugins/)
you can alter the `PLUGINS` inside `src/utils/constants.ts` and add your extra plugins there.

### Build and replace your mpk

-   Run `pnpm run build` to create your new .mpk file from the current `packages/pluggableWidgets/rich-text-web` folder.
    it will be build inside `dist/[version]/RichText.mpk`.
-   Copy and replace this file into your project's widgets folder.
