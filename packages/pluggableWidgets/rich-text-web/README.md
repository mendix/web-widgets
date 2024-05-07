Please see [Rich Text](https://docs.mendix.com/appstore/widgets/rich-text) in the Mendix documentation for details.

## Extending and code alteration guide for premium plugin usage:

-   fork or clone this repository to create your own implementation
-   run `pnpm install`

### Get your API Key

-   Create an account on [tinymce](https://www.tiny.cloud/) and get your API Key
-   add the api key to `src/components/Editor.tsx`

```
<Editor apiKey="your-api-key">
```

### Using tinymce cloud

To get premium features works, you need to use tinymce cloud instead of bundled version.
to do this, you will need:

-   remove tinymce from `package.json` dependencies
-   remove the global declaration of tinymce from `typings/global.d.ts`. you will need to remove the following line:
    -   `import tinymce from "tinymce";`
    -   inside declare global json: `var tinymce = tinymce;`
-   remove all import from tinymce in `Editor.tsx`. this is no longer needed because tinymce will be retrieved directly from the tinymce cloud script.
-   remove `baseUrl` declaration from `src/utils/constant.ts` which is set in `DEFAULT_CONFIG`

### Insert the premium plugins

follow the instruction on [tinymce plugin](https://www.tiny.cloud/docs/tinymce/latest/plugins/)
you can alter the `PLUGINS` inside `contant.ts` and add your extra plugins there.

### Build and replace your mpk

run `pnpm run build` to create your new .mpk file.
it will be build inside `dist/[version]/RichText.mpk`.
copy and replace this file into your studio pro widget folder.
