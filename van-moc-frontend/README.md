# React + TypeScript + Vite

## Vân Mộc API configuration

Run commands from `van-moc-frontend`. Copy `.env.example` to `.env` only if it does not exist; set required `VITE_API_BASE_URL` to the backend origin (local `http://localhost:30000`). Restart Vite after changes. Never put client secrets in VITE variables; they are public build-time configuration. Backend `FRONTEND_ORIGIN` must match the Vite origin.

`npm run build` and `npm run lint` validate the frontend. `/shop` and `/shop/:uuid` read the real catalog; invalid/numeric IDs do not fall back to sample products. Images with local `/image/...` paths resolve against the frontend origin. Missing images show a placeholder message rather than a demo product image.

`/login` starts backend Google OIDC; `/account` reads `/api/me`; `/account/addresses` manages user addresses with credentials and session-bound CSRF tokens. Configure real Google credentials only in backend `.env`. Live Google login/browser flow remains unverified. Legacy local carts are preserved but not migrated to UUIDs or automatically merged. CartContext now uses `/api/cart` as its sole data source; add/update/delete require login and CSRF. Backend determines prices and totals; failures are displayed, not replaced by local demo rows. Engraving text can be edited or removed in the cart; font/position can be selected when adding on the detail page.

Checkout and order-history demos are disconnected from routing until real checkout/order milestone E is implemented. Existing demo source files are retained rather than deleting user work; they are not a working payment flow or real history. This frontend is not yet production e-commerce.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
