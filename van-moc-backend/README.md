# Vân Mộc backend

Java 21, Spring Boot, PostgreSQL, Flyway. Feature-first N-tier: controller → service → repository, with entities, DTOs and mappers. Read-only location/product APIs are public; other routes remain blocked until authentication is implemented.

## Local setup (PowerShell)

Start Docker Desktop first. In this directory, create `.env` if it does not exist and edit it before running:

```powershell
$env:JAVA_HOME = 'C:\path\to\jdk-21'
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env: replace DB_PASSWORD and adjust other values.
docker compose up -d
.\mvnw.cmd spring-boot:run
```

Spring imports `.env` as a required Java properties file; Docker Compose also reads it automatically. Run commands with the backend directory as the working directory. `.env` is Git-ignored; `.env.example` is the committed template. Do not quote values or use shell `export` syntax. YAML contains no fallback values for environment placeholders. Operating-system environment variables can override imported properties; unset stale overrides when testing `.env` changes.

Required settings: `SPRING_PROFILES_ACTIVE`, `SERVER_PORT`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_ORIGIN`. Compose additionally requires `DB_NAME` and `DB_PORT`. Keep `DB_URL` consistent with the Compose database name and host port. The template uses port 30000 for the backend. Replace the local placeholder password before use. No actual secret is committed.

Flyway creates all Phase 1 tables; Hibernate validates mappings, never updates the schema. Use a fresh database for the initial migration. Do not baseline an existing database without reviewing its schema.

The `local` profile loads example products only. Do not switch a seeded local database into a production database.

## Production configuration without `.env`

For container deployment with Jib (Java 21, no Dockerfile or local Docker daemon), see [Deploy with Jib on EC2](../docs/deploy-jib.md). Build with `.\mvnw.cmd clean verify jib:buildTar`, transfer the image TAR plus the private YAML, then run `compose.prod.yaml` on EC2. This replaces the systemd/JAR launch described below when deploying containers.

Use a private, standalone `application-prod.yaml` in the backend directory, outside `src/main/resources`. Both `application-prod.yaml` and `application-prod.yml` are Git-ignored. The external file is not bundled into the JAR and must be copied to EC2 separately. Keep your own copy: a fresh Git clone will not contain it.

Set the database password, Google OAuth credentials and any enabled SePay integration settings directly in this YAML file. Quote secret strings as YAML strings. Keep AWS access/secret keys out of the YAML: `aws.access-key` and `aws.secret-key` use `${AWS_ACCESS_KEY:}` and `${AWS_SECRET_KEY:}`. For the container deployment, copy `prod.env.example` to the Git-ignored `.env.prod`, fill in the AWS keys and transfer it separately to EC2; `compose.prod.yaml` passes them to the container. Protect the file with `chmod 600 /opt/vanmoc/.env.prod`. Do not commit or print its values. For a direct JAR launch instead, export `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` in the service environment before starting Java. The production configuration uses `https://vanmocvn.com`, `https://admin.vanmocvn.com`, the Google callback `https://api.vanmocvn.com/login/oauth2/code/google`, secure cookies, and backend port 30000 bound to loopback behind Nginx. Register the callback in Google Cloud Console.

Build as usual, then run from the backend directory:

```powershell
.\mvnw.cmd clean package
java -jar target/vanmoc-backend-0.0.1-SNAPSHOT.jar --spring.config.location=file:./application-prod.yaml --spring.profiles.active=prod
```

`spring.config.location` replaces the default configuration locations. This standalone configuration does not load the packaged `application.yaml`, its `.env` imports, or the local seed profile. Use `spring.config.location`, not `spring.config.additional-location`. The file is required: a missing file fails startup. Standard Spring command-line/system/environment property overrides still apply.

On EC2, put `app.jar` and `application-prod.yaml` in `/opt/vanmoc`, make the configuration readable by the service user (`ubuntu` in the deployment example), and set file permissions:

```bash
chmod 600 /opt/vanmoc/application-prod.yaml
```

Use this systemd `ExecStart`:

```ini
ExecStart=/usr/bin/java -Xms128m -Xmx384m -jar /opt/vanmoc/app.jar --spring.config.location=file:/opt/vanmoc/application-prod.yaml --spring.profiles.active=prod
```

After changing the service, run `sudo systemctl daemon-reload` and `sudo systemctl restart vanmoc`. After changing only YAML values, restart the service. This configures the backend datasource; PostgreSQL must already be provisioned with matching credentials. The existing local `compose.yaml` still expects its own environment variables and does not read Spring YAML.

## Location initialization

Configure all location settings in `.env` (no YAML fallback values):

- `LOCATION_INIT_MODE`: `DISABLED`, `IF_EMPTY`, or `REFRESH`.
- `LOCATION_PROVINCES_URL`: `https://provinces.open-api.vn/api/v2/p/`.
- `LOCATION_WARDS_URL`: `https://provinces.open-api.vn/api/v2/w/`.
- `LOCATION_CONNECT_TIMEOUT_MS`, `LOCATION_READ_TIMEOUT_MS`: positive timeout values.

`IF_EMPTY` skips fetching only when both tables contain data. It does not detect an incomplete existing dataset. If your database contains the earlier Hanoi sample, set `REFRESH` for one startup, then restore `IF_EMPTY`. The updated local seed no longer inserts locations but does not delete existing rows.

The initializer fetches both lists, checks required fields, duplicate codes/codenames and ward-to-province references, then batch-upserts provinces followed by wards in one database transaction. Network calls occur before the transaction. Errors abort startup; old location records are not deleted. Initialization runs after Flyway/JPA startup. `REFRESH` accesses the external service on every startup until changed back. Remote source availability and data quality remain external dependencies.

## APIs

- `GET /api/provinces`
- `GET /api/provinces/1/wards`
- `GET /api/categories`
- `GET /api/products?categoryId=<uuid>&page=0&size=12` (size 1–100, newest first)
- `GET /api/products/20000000-0000-0000-0000-000000000001`

Only active products under active categories are returned, including out-of-stock products. List items now include nullable `imageUrl`: primary image first, otherwise lowest `displayOrder`, then lowest image ID; no images yields null. Images are fetched in one batch per page, and category is fetched with products to avoid N+1 queries. Existing fields and endpoints are unchanged.

Detail includes images and supported engraving options. Effective position `maxChars` inherits the product limit when absent, and is capped at the product limit when both are present. This does not rewrite stored configuration or introduce database constraints. Disabled engraving returns no fonts/positions.

Unknown category filters return an empty page. Errors use ProblemDetail with stable `code`: `VALIDATION_ERROR` for Bean Validation (with `invalid_params`), `INVALID_PARAMETER` for malformed path/typed parameters, `INVALID_REQUEST_BODY` for malformed bodies, and `PRODUCT_NOT_FOUND` / `PROVINCE_NOT_FOUND` for missing/hidden resources. Titles/details support `Accept-Language: vi` and `en`; default is Vietnamese. The project advice takes precedence over Boot's default ProblemDetail advice.

Local image paths point to frontend public assets; resolve them against the frontend origin, not the backend server. CORS permits GET/preflight only from `FRONTEND_ORIGIN`; other routes remain denied by security filters.

The OpenAPI location client needs `spring-boot-starter-restclient` (Spring Boot 4 modular auto-configuration). Keeping only the MVC starter does not provide `RestClient.Builder`. After dependency changes, reload Maven in the IDE before restarting.

## Google login and account APIs

### JWT for customer APIs

Google OAuth still starts at `/oauth2/authorization/google` and uses its short-lived server session for the redirect/state handshake. On success the backend sends a signed JWT in the `VM_ACCESS` HttpOnly cookie and redirects to the storefront. Admin password login also issues a JWT, in a separate `VM_ADMIN` HttpOnly cookie (no persistent login session). The two token types cannot be used interchangeably; both re-check the database user's active status and Admin tokens require a current Admin account. The token is not returned in URLs or stored in browser localStorage. `POST /api/auth/logout` clears both cookies (with the existing CSRF token); closing the browser alone does not revoke a token, and an already stolen token remains usable until expiration or key rotation. JWT cookies require the same-origin/same-site and CORS settings described below.

Set `JWT_SECRET` to a random secret of at least 32 bytes (keep it private and consistent across instances), and optionally `JWT_TTL_SECONDS` (default 3600, also applies to Admin). A local development secret may be kept in the ignored backend `.env`; configure `app.auth.jwt-secret` in the private standalone production YAML too. Rotating the secret invalidates all existing tokens. Restart the backend after configuration changes. Existing Admin sessions must log in again once to receive a JWT. Restart alone does not invalidate an unexpired JWT if the secret stays the same.

### PostgreSQL-backed sessions

Cookie session IDs are validated as Spring Session UUIDs after cookie decoding and before JDBC access. Legacy Tomcat JSESSIONID values or malformed cookies are treated as absent sessions; a CSRF/login request that creates a session overwrites the old cookie. This prevents decoded NUL bytes from triggering PostgreSQL `invalid byte sequence for encoding UTF8` errors. No session IDs or cookie values are logged. Restart after this fix and begin a fresh login; clearing the localhost JSESSIONID cookie is an optional immediate workaround, not a database repair.

Sessions use Spring Session JDBC on the existing PostgreSQL datasource, not a servlet-container in-memory store. Flyway migration `V2__create_jdbc_session_tables.sql` creates `spring_session` and `spring_session_attributes` plus session-ID, expiration and principal indexes; automatic Spring schema initialization is disabled. No JPA session entity or custom session CRUD API is needed.

Required `.env` settings: `SESSION_TIMEOUT=30m` (inactivity timeout) and `SESSION_CLEANUP_CRON=0 * * * * *` (remove expired sessions every minute). Existing cookie settings remain required. `JSESSIONID` is still used for CSRF tokens and OAuth state, while `VM_ACCESS` and `VM_ADMIN` authenticate storefront and Admin respectively. Both frontends continue sending credentials and CSRF tokens unchanged.

Session attributes include serialized Spring Security/OIDC state, potentially identity tokens and authentication-flow secrets. Treat these tables and backups as sensitive: restrict database access, use protected backups and TLS for remote database connections; do not expose attribute bytes or log them. Expired sessions are rejected immediately, even before scheduled cleanup. Logout deletes the session and its attributes through a cascading foreign key. No persistent browser-cookie lifetime/remember-me is enabled.

Backend restarts and multiple instances can reuse unexpired sessions when they share the database, cookie configuration and compatible application classes. Java-serialized principal changes can invalidate old sessions during upgrades; do not promise sessions survive incompatible deployments. JDBC reduces long-lived session retention in backend RAM but still uses transient memory and database resources. The existing Google authorized-client storage is not made durable by this change; it is not needed for the current profile/cart APIs and no Google API integration is added here.

Verification: PostgreSQL Testcontainers covers session persistence, deserialization of the real application principal/security context, cookie-authenticated `/api/me`, CSRF logout, expired-session rejection and cleanup/cascade. No live user database or Google callback was used for these tests.

Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_COOKIE_SECURE`, and `SESSION_COOKIE_SAME_SITE` in the existing backend `.env` using `.env.example` as reference. Do not overwrite an existing `.env` or print its values. Placeholder credentials do not provide working Google login. Register the exact callback URI in Google Cloud Console and configure the consent screen/test users. Login starts at `/oauth2/authorization/google`; callback is `/login/oauth2/code/google`; successful login redirects to `${FRONTEND_ORIGIN}/shop`.

Only a verified Google OIDC identity is accepted. Users are looked up by subject; an email collision fails login instead of merging accounts. Inactive users cannot log in or access account/address operations. Roles come from the database, never Google/client claims. No stub-login route is shipped.

`GET /api/me` reads the authenticated profile. `GET /api/auth/csrf` returns a session-bound token/header name; send it on POST/PATCH/DELETE with credentials. `POST /api/auth/logout` invalidates the session and removes JSESSIONID. Address APIs are `GET/POST /api/addresses`, `PATCH/DELETE /api/addresses/{id}`. PATCH sends the full editable address fields. Ward determines province server-side; user ownership is checked. Default-address writes serialize on the owner row. Auditing uses the local authenticated user UUID.

Local HTTP uses `SESSION_COOKIE_SECURE=false`, `SESSION_COOKIE_SAME_SITE=lax`. Production requires HTTPS and `Secure=true`; preferably deploy frontend/backend on the same site. Cross-site deployments require `SameSite=none` with Secure and browser third-party-cookie support, explicit credentialed CORS origin, and CSRF tokens. Configure trusted proxy/TLS forwarding at deployment; no permissive wildcard origins. Google live callback/browser persistence has not been verified without real credentials.

## Cart APIs

Authenticated `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/{id}`, `DELETE /api/cart/items`. POST accepts productId, quantity, optional engraving `{text,font,position}`. PATCH accepts quantity and the complete optional engraving (null removes engraving). Backend always calculates current prices/fees; client-supplied price fields are not calculation inputs. Same normalized product/text/font/position merges; different engraving stays separate. Per-piece fees multiply quantity. Add/update checks aggregate quantity across product lines but does not reserve stock; checkout must recheck under product locks.

Owner row locks serialize cart creation/mutations. Inactive products/categories and invalid engraving cannot be added/updated; existing unavailable configurations are flagged in cart reads so the customer can remove them. Engraving uses NFC/trim, configured font/position/maxChars and an allowlist of letters, combining marks, digits, ASCII space, and common punctuation `. , ' ’ ! ? ( ) : ; / & -`; controls and emoji are rejected. No inventory is deducted by cart operations.

Frontend cart now calls these APIs and never loads/persists localStorage as the cart source. Legacy local data is left untouched and is not automatically merged. Checkout demo route is disconnected until milestone E provides real order creation; no client payment confirmation is exposed from that route.

## Product image uploads (AWS S3)

Set these values in the backend `.env`, then restart the backend:

```dotenv
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=ap-southeast-1
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain
```

The AWS identity needs `s3:PutObject` on `arn:aws:s3:::your-bucket/*` for uploads and `s3:DeleteObject` on the same resource to clean up media when an unreferenced product is permanently deleted. The CloudFront distribution must serve this bucket and have permission to read its objects. Credentials stay on the backend. AWS settings have empty defaults so the application can start before AWS is configured; uploading requires all five values. If post-commit S3 cleanup fails, the product is already deleted and an object may remain in S3; the storage key is logged for manual cleanup.

In admin, save a new product first, then use **Ảnh sản phẩm → Chọn ảnh → Tải ảnh lên** on its edit page. Each upload is saved immediately. The first image is primary; subsequent images are appended to the gallery. Reloading the page reads saved images from the database.

`POST /api/admin/products/{productId}/images` accepts multipart field `file`, requires an admin session and the existing CSRF header, and returns HTTP 201 with `{id, url, altText, primary, displayOrder}`. Admin product responses include an `images` array. The admin API helper sends FormData with the browser-generated multipart boundary.

Objects use UUID keys directly at the bucket root. The original Content-Type is sent to S3. Upload streams go through the backend; no bucket CORS configuration is needed for uploads. There is no file type, extension, size or dimension validation; Spring multipart file/request size limits are disabled. Any reverse proxy must also allow the intended upload size.

S3 I/O runs outside the database transaction. After uploading, a short transaction locks the product and saves the existing `product_images` fields, serializing primary-image selection and display order. Storefront list/detail APIs already consume these records. An S3 failure creates no image row and returns `PRODUCT_IMAGE_UPLOAD_FAILED`; a database failure after a successful upload can leave an unreferenced S3 object.

## Tests

```powershell
# Unit/controller/architecture/client tests: no Docker or PostgreSQL needed.
.\mvnw.cmd test

# Requires Docker Desktop. Runs the above tests plus PostgreSQL integration tests.
.\mvnw.cmd -Pintegration verify
```

Integration tests are named `*IT` and run with Maven Failsafe only in the `integration` profile. The old database-dependent `contextLoads` test has been replaced by `integration/PostgresReadApiIT`. Missing Docker fails the integration run rather than silently skipping PostgreSQL verification. No H2 is used.

Tests start a disposable `postgres:17-alpine` container on a random port; datasource settings override the user's `.env`. Required `.env` import remains active, so create it from the template if needed. The local seed and V1 schema are migrated and all JPA entities are validated. Tests cover active/category filtering, pagination, image selection and query count, engraving mapping, location upsert/rollback, and public API/CORS through the real security filter chain. Location initialization starts in `DISABLED`; explicit initialization tests stub the client, while client unit tests use a loopback HTTP server. Tests never call the real location API or modify the user's database/volumes.

Verified on Java 21.0.12 and PostgreSQL 17.11 via Testcontainers. This does not verify migration history or connectivity of an existing user database, nor availability/completeness of the live location service. Review the existing database before running against it; do not use `REFRESH` without approval. Do not repair migration checksums or delete volumes to force startup.
