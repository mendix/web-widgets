Please see [Rich Text](https://docs.mendix.com/appstore/widgets/rich-text) in the Mendix documentation for details.

## Extending and code alteration guide for premium plugin usage:

-   fork or clone this repository to create your own implementation
-   run `pnpm install`
-   read more detail on how to run your forked widget from this [readme](/README.md)

### Get your API Key

-   Create an account on [tinymce](https://www.tiny.cloud/) and get your API Key
-   add the api key to `src/utils/constants.ts` on `API_KEY` constant value.

```
const API_KEY= 'your-api-key'
```

### Clear local tinymce declarations

To get premium features works, you need to use tinymce cloud instead of bundled version.
to do this, you will need:

-   remove the global declaration of tinymce from `typings/global.d.ts`. you will need to remove the following line:
    -   `import tinymce from "tinymce";`
    -   inside declare global json: `var tinymce = tinymce;`
-   clear the content of `src/utils/plugins.ts` as this is no longer needed and will be import directly from tinymce cloud script.

### Insert tiny mce cloud script

include your tinymce cloud script on the page.

```
<script src="https://cdn.tiny.cloud/1/your-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
```

### Insert the premium plugins

follow the instruction on [tinymce plugin](https://www.tiny.cloud/docs/tinymce/latest/plugins/)
you can alter the `PLUGINS` inside `src/utils/constants.ts` and add your extra plugins there.

### Build and replace your mpk

run `pnpm run build` to create your new .mpk file from the current `pluggableWidgets/rich-text-web` folder.
it will be build inside `dist/[version]/RichText.mpk`.
copy and replace this file into your studio pro widget folder.
