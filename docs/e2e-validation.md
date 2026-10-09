# E2E / validation report — 2026-10-08

## Result and scope

- Backend: `mvnw.cmd -Pintegration verify` — **29 unit/controller/architecture + 32 PostgreSQL integration tests**, zero failures/errors/skips.
- Storefront and admin: `npm.cmd run build` and `npm.cmd run lint` both pass.
- Chrome headless, real Vite frontend → real HTTP backend → separate PostgreSQL: **15 scenario groups pass**, no captured uncaught JavaScript exceptions.
- This is local application E2E after customer authentication, NOT verification of Google callback or an actual bank transfer. Some admin lifecycle assertions use HTTP requests from the browser, not clicks on the transition controls.
- No production/user database, `.env`, migration, application behavior or UI design was changed. Tests and this report were added.

## Isolation and evidence

- Browser database: container `vanmoc-e2e-20261008`, database `vanmoc_e2e`, localhost port 55438. Only its disposable business fixtures were truncated between test attempts.
- Backend 31008; storefront 5273; admin 5274; Chrome CDP 9337, separate browser profile.
- External Google credentials and bank settings overridden with test values for this backend process; local HMAC-signed payloads use test-only account data.
- Customer identity created using the existing test-only `OidcTestIdentity`, serialized into a JDBC session in the isolated database. No login bypass route was added to the application.
- Integration suite uses independent Testcontainers PostgreSQL 17.11 databases and validates Flyway V1–V4/local seed and Hibernate mappings.
- Browser runner: `scripts/e2e-browser.mjs`.
- Browser results: `C:/Users/Acer/AppData/Local/Temp/opencode/vanmoc-e2e-results.json`.
- Mobile QR screenshot: `C:/Users/Acer/AppData/Local/Temp/opencode/vanmoc-e2e-bank-mobile.png`.
- Local session-fixture helper: `C:/Users/Acer/AppData/Local/Temp/opencode/VanmocE2eSession.java` (fixed isolated datasource; cookie output is sensitive and must not be committed).
- Maven evidence: `van-moc-backend/target/surefire-reports/` and `van-moc-backend/target/failsafe-reports/`.

The runner requires this isolated stack and a fresh fixture/session. It is not a general-purpose script to run against an existing database. It creates orders, product, inventory and shipping mutations. Do not retarget it to production. Before rerunning, reset ONLY the isolated business fixtures, remove/reset the runner's E2E product if necessary, and recreate the test customer session; logout revokes the previous session.

## Browser scenarios executed

| Group | Verified |
|---|---|
| Anonymous | `/api/me` returns 401 |
| Customer session | Account loads correct persisted user, navigation/reload preserve identity |
| Address | Empty required fields invalid; alphabetic phone rejected by backend without creating address; valid province/ward/address persists |
| Personalization/cart | Blank engraving disables add; valid engraving retained; quantity +/− persists; empty selection disables checkout |
| COD checkout | UI creates actual order, snapshot includes engraving, selected cart emptied |
| Permissions | Customer denied admin orders |
| Bank checkout | Real order/QR/account/code/amount; manual check stays pending, not fake paid; mobile has no horizontal document overflow |
| Webhook/polling | Signed test event changes real backend to PAID; browser polling displays success; paid bank cannot be cancelled by customer |
| History/detail | Real history and bank-order detail render, mobile no horizontal document overflow |
| Admin login | Wrong password shows rejection; actual password login creates usable session |
| Admin COD lifecycle | Browser HTTP rejects skipped step and missing collection; sequential states and final collection succeed; detail UI renders |
| Admin navigation | Products/shipping/orders load without alert; session survives reload |
| Product/stock | Empty product rejected; UI create/edit persist; stock starts at zero; confirmed adjustment +3 persists |
| Shipping | Negative/fractional HTML input invalid; UI provincial override and reset persist |
| Logout | Revokes backend admin session; subsequent admin me returns 401 |

## Backend validation and integrity coverage

Existing tests were rerun, and five test methods were added to `PostgresReadApiIT.java`:

1. Address/checkout API validation matrix: empty body, blank/oversized name/address, invalid phone, non-positive ward, missing default flag, malformed UUID, empty/null cart selection, unknown/null payment enum, blank/oversized idempotency key, duplicate cart IDs, CSRF rejection, preview and duplicate create. Assert failed requests leave order/stock/cart unchanged.
2. Same-user concurrent idempotency retry: two simultaneous attempts return the same order; one payment/movement, stock deducted once.
3. Eight webhook/cancel or webhook/expiry concurrent scenarios: signed payload with correct gateway/account/amount; no combination of paid and restored stock; expiry remains repeat-safe. Expiry scenarios use an already elapsed deadline (not a clock-boundary stress test).
4. Admin API validation matrix: blank/oversized required product fields, malformed slug, negative/fractional price, negative engraving fee, invalid limits, missing position/font/version, out-of-range delta, blank/oversized stock note, missing/unknown transition state; assert no product/stock mutation.
5. Database fault injection before payment insert: checkout rollback leaves no partial order/items/payment/history/movement, stock and cart preserved; after removing fault, same request succeeds. Trigger/function exist only in the disposable Testcontainers database and are removed in finally.

Rerun existing coverage: visibility/pagination/images, ownership, inactive accounts, session expiry/malformed cookies, CSRF/CORS, Google scope wiring, engraving rules and aggregate stock, cart concurrent merge, snapshot immutability, last-item checkout race, cancellation/expiry once, admin roles/version/duplicate SKU, shipping fallback/free/override snapshots, signed/duplicate/stale/tampered webhook and wrong amount/account/direction/late payment, location import validation/rollback.

## Not yet verified / limitations

“All cases” is not an exhaustive guarantee. These remain explicitly **NOT TESTED**, not PASS:

- Live Google consent/callback, provider errors and deployed cross-site cookie/TLS behavior.
- Live SePay parsing of a real bank transaction, dashboard delivery/retry and reconciliation of old transfers.
- Every DTO field's exact min/max boundary, every malformed JSON/type combination, all unsupported HTTP methods, every form validation error displayed per-field.
- Webhook fault-injection retry after transaction failure; multiple-part-payment reconciliation in full live workflow.
- High-load/deadlock stress, inventory-adjustment versus checkout race, expiry/payment exact deadline boundary.
- Browser network loss/timeout, reload after ambiguous checkout response, QR clipboard permission/timeout/copy regression and browser expiry countdown.
- Complete click-driven admin transition/COD collection, customer cancellation UI, address edit/delete/default switching, catalog filter pagination and out-of-stock UI permutations.
- Stored XSS/security audit, accessibility, multiple browsers, visual comparison and all responsive screens.
- Product image upload is not implemented and cannot be tested as a completed feature.

### Observation during runner development

After a previous checkout and adding a cart row through the test HTTP helper, navigating directly to the same `/checkout` URL produced an empty selected checkout while the header cart count was one. Going through `/cart` and selecting checkout succeeded. The page intentionally reads `location.state.cartItemIds`; stale history selection may explain this. This is an observation, **not a confirmed general direct-checkout bug**. A separate fresh-tab/history-state regression is still needed; no application fix was made in a testing-only task.

Initial runner failures caused by waiting for an input value as visible text, confusing summary `orderId` with detail `id`, omitting webhook gateway, and omitting required serialized collectCod were corrected in the test harness. Final results above refer to the corrected run, not those incomplete attempts.
