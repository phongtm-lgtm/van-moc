# Storefront completion notes

## Official contact data

`van-moc-frontend/src/brand.ts` is the shared source for the supplied hotline,
email, Facebook and Messenger links. No storefront address or service hours
have been confirmed; the footer does not represent a craft village address
as a verified shop address.

## Policies

Purchase and privacy pages replace the former title-only placeholders.
They describe existing workflows without inventing delivery guarantees,
return windows or refund deadlines. The owner should review the wording and
provide approved return/refund terms, delivery estimates, retention periods
and legal business identity before treating these pages as a complete legal
handover. They are not a legal compliance certification.

## SEO scope

- Static HTML contains default Open Graph metadata and Organization JSON-LD.
- React updates title, description, canonical and social metadata on navigation;
  product detail metadata uses the real loaded product.
- Account, checkout, cart, login and unknown routes receive client-side noindex.
  Robots disallows the main private paths, but is not access control.
- Sitemap lists confirmed public static routes only, not sample products or
  the hardcoded traceability demonstration. Add dynamic product sitemap
  generation when the official catalog is ready.
- This remains a client-rendered SPA. Crawlers that do not execute JavaScript,
  including many social preview bots, see shared static HTML metadata.
  Route-specific server-rendered/prerendered previews remain future work.

## CI

`.github/workflows/ci.yml` runs storefront/admin npm ci, lint and build, plus
backend unit/integration verification with Java 21 and Testcontainers on the
GitHub-hosted runner. It uses no production database or private credentials.
Branch protection and making CI a required check must be configured separately
in GitHub settings; this workflow does not prevent Vercel from deploying a push
before checks finish.

## Shared cards

Home and catalog use `components/ProductCard.tsx` and `ProductCard.css`.
Home keeps the carousel and its image ratio. Purchase/cart navigation and
engraving redirection are preserved. Both variants handle image failures.
