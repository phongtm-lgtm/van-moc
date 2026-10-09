# Backend architecture

- Use feature-first N-tier: `controller`, `service`, `repository`, `entity`, `dto`, `mapper`, `enums`; external integrations use `client` and `initializer`.
- Use `product`, not `catalog`. Do not create empty layers or speculative abstractions.
- Use JPA entities as internal models; do not create duplicate domain records or pass-through ports/adapters.
- Controllers call services; services call repositories and map entities to DTOs within transactions.
- Entity relationships may cross modules; controllers must not access entities, repositories or JDBC directly.
- Do not declare `length`, `nullable`, `optional`, or Bean Validation annotations on entities. Validate HTTP requests with Jakarta Bean Validation and `@Valid`; enforce business rules in services.
- Keep identity, foreign keys, uniqueness, optimistic locking, monetary precision, and storage types. Removing explicit length does not remove a database's default VARCHAR limit; use TEXT for long content/URLs.
- Spring does not automatically validate arbitrary models: request validation and business checks must be implemented before exposing APIs.
- Business rules belong in services. No automatic interface/Impl pairs. Keep network calls outside database transactions.
- Saved addresses store `ward_code` and `address_line`; province is derived through the ward. Orders store historical address snapshots.
- Do not expose JPA entities through APIs. Do not calculate prices, modify stock, or confirm payments in controllers.
- Schema changes require migrations when persistence is wired. No database migration is implied by a Java model change.
