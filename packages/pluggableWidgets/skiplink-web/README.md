# SkipLink Web Widget

A simple accessibility widget that adds a skip link to the top of the page. The link is only visible when focused and allows users to jump directly to the main content.

## Usage

1. Place the `<SkipLink />` component at the very top of your page or layout.
2. Ensure your main content container has `id="main-content"`.

    ```jsx
    <SkipLink />
    <main id="main-content">Main content here</main>
    ```

## Accessibility

- The skip link is visually hidden except when focused, making it accessible for keyboard and screen reader users.

## End-to-End Testing

E2E tests are located in the `e2e/` folder and use Playwright. Run them with:

```
npm install
npx playwright install
npm test
```
