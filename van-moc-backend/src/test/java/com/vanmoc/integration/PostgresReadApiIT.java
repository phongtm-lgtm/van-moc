package com.vanmoc.integration;

import com.vanmoc.location.client.OpenApiLocationClient;
import com.vanmoc.location.dto.importdata.*;
import com.vanmoc.location.repository.LocationImportRepository;
import com.vanmoc.location.service.LocationInitializationService;
import com.vanmoc.product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.hibernate.SessionFactory;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.profiles.active=integration,local", "app.location.init-mode=DISABLED",
        "app.cors.allowed-origin=http://localhost:5173",
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.security.oauth2.client.registration.google.client-id=integration-client",
        "spring.security.oauth2.client.registration.google.client-secret=integration-not-a-real-secret",
        "spring.security.oauth2.client.registration.google.redirect-uri=http://localhost/login/oauth2/code/google",
        "server.servlet.session.cookie.secure=false", "server.servlet.session.cookie.same-site=lax",
        "spring.session.timeout=30m", "spring.session.jdbc.cleanup-cron=0 * * * * *",
        "app.payment.sepay.enabled=true", "app.payment.sepay.webhook-secret=integration-hmac-secret",
        "app.payment.sepay.account-number=123456789", "app.payment.sepay.bank=Vietcombank",
        "app.checkout.payment-timeout-minutes=15",
        "aws.access-key=test-key", "aws.secret-key=test-secret",
        "aws.s3.bucket=test-product-images", "aws.s3.region=ap-southeast-1",
        "aws.cloudfront.url=https://images.example.test/"
})
@AutoConfigureMockMvc
@Testcontainers
class PostgresReadApiIT {
    @Container
    static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ProductService products;
    @Autowired LocationImportRepository importer;
    @Autowired LocationInitializationService initialization;
    @Autowired MockMvc mvc;
    @Autowired EntityManagerFactory entityManagerFactory;
    @Autowired org.springframework.core.env.Environment environment;
    @Autowired com.vanmoc.user.service.UserService users;
    @Autowired com.vanmoc.user.service.JwtService jwt;
    @Autowired com.vanmoc.user.service.AddressService addresses;
    @Autowired com.vanmoc.cart.service.CartService cart;
    @Autowired com.vanmoc.order.service.CheckoutService checkout;
    @Autowired com.vanmoc.order.service.OrderLifecycleService lifecycle;
    @Autowired com.vanmoc.order.service.OrderReadService orderReads;
    @Autowired com.vanmoc.shipping.service.ShippingService shippingRates;
    @Autowired com.vanmoc.user.initializer.AdminAccountInitializer adminInitializer;
    @Autowired com.vanmoc.order.service.AdminOrderService adminOrders;
    @Autowired com.vanmoc.product.service.AdminProductService adminProducts;
    @Autowired com.vanmoc.inventory.service.AdminInventoryService adminInventory;
    @Autowired org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrations;
    @Autowired org.springframework.session.jdbc.JdbcIndexedSessionRepository jdbcSessions;

    @SuppressWarnings({"unchecked", "rawtypes"})
    private org.springframework.session.SessionRepository<org.springframework.session.Session> sessionRepository() {
        return (org.springframework.session.SessionRepository) jdbcSessions;
    }
    @MockitoSpyBean OpenApiLocationClient source;
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    software.amazon.awssdk.services.s3.S3Client s3;
    @Autowired com.vanmoc.product.service.ProductImageService productImages;

    static final UUID CATEGORY = UUID.fromString("10000000-0000-0000-0000-000000000001");
    static final UUID OTHER_CATEGORY = UUID.fromString("10000000-0000-0000-0000-000000000002");
    static final UUID PRODUCT = UUID.fromString("20000000-0000-0000-0000-000000000001");
    static final UUID FALLBACK = UUID.fromString("20000000-0000-0000-0000-000000000002");
    static final UUID NO_IMAGE = UUID.fromString("20000000-0000-0000-0000-000000000003");

    @BeforeEach
    void seed() {
        // Only this disposable container is touched. Never use the user's datasource.
        jdbc.update("delete from spring_session");
        jdbc.update("delete from shipping_rates where province_code <> 0");
        jdbc.update("update shipping_rates set fee=30000 where province_code=0");
        jdbc.update("delete from payment_webhook_events");
        jdbc.update("delete from payments");
        jdbc.update("delete from stock_movements");
        jdbc.update("delete from order_items");
        jdbc.update("delete from order_status_history");
        jdbc.update("delete from orders");
        jdbc.update("delete from cart_items");
        jdbc.update("delete from carts");
        jdbc.update("delete from product_engraving_positions");
        jdbc.update("delete from product_engraving_fonts");
        jdbc.update("delete from product_images");
        jdbc.update("delete from products");
        jdbc.update("delete from categories");
        jdbc.update("delete from addresses");
        jdbc.update("delete from users");
        jdbc.update("delete from wards");
        jdbc.update("delete from provinces");
        jdbc.update("insert into categories(id, name, slug, active, display_order) values (?, 'Visible', 'visible', true, 0)", CATEGORY);
        jdbc.update("insert into categories(id, name, slug, active, display_order) values (?, 'Other', 'other', true, 1)", OTHER_CATEGORY);
        var hiddenCategory = UUID.randomUUID();
        jdbc.update("insert into categories(id, name, slug, active, display_order) values (?, 'Hidden', 'hidden', false, 2)", hiddenCategory);
        product(PRODUCT, CATEGORY, true, 0);
        product(FALLBACK, CATEGORY, true, 2);
        product(NO_IMAGE, OTHER_CATEGORY, true, 4);
        product(UUID.randomUUID(), CATEGORY, false, 10);
        product(UUID.randomUUID(), hiddenCategory, true, 20);
        image(PRODUCT, 1, 0, false, "/first.jpg");
        image(PRODUCT, 2, 9, true, "/primary.jpg");
        image(FALLBACK, 3, 2, false, "/later.jpg");
        image(FALLBACK, 4, 0, false, "/fallback.jpg");
        image(FALLBACK, 5, 0, false, "/tie.jpg");
        jdbc.update("insert into product_engraving_fonts(id, product_id, font, display_order) values (?, ?, 'SCRIPT', 1), (?, ?, 'SERIF', 0)",
                UUID.randomUUID(), PRODUCT, UUID.randomUUID(), PRODUCT);
        jdbc.update("insert into product_engraving_positions(id, product_id, position, max_chars, display_order) values (?, ?, 'FRONT', 20, 0), (?, ?, 'HANDLE', 8, 1), (?, ?, 'BACK', null, 2)",
                UUID.randomUUID(), PRODUCT, UUID.randomUUID(), PRODUCT, UUID.randomUUID(), PRODUCT);
    }

    private void product(UUID id, UUID category, boolean active, int seconds) {
        jdbc.update("""
                insert into products(id, category_id, code, slug, name, price, stock, active,
                engraving_enabled, engraving_max_chars, engraving_fee, version, created_at)
                values (?, ?, ?, ?, 'Product', 320000.00, 0, ?, true, 12, 50000.00, 0,
                timestamptz '2026-01-01 00:00:00+00' + (? * interval '1 second'))
                """, id, category, id.toString(), id.toString(), active, seconds);
    }

    private void image(UUID product, int id, int order, boolean primary, String url) {
        jdbc.update("insert into product_images(id, product_id, image_url, display_order, is_primary) values (?, ?, ?, ?, ?)",
                UUID.fromString("30000000-0000-0000-0000-" + String.format("%012d", id)), product, url, order, primary);
    }

    @Test
    void migrationsAndAllJpaMappingsValidateOnPostgres() {
        assertTrue(postgres.isRunning());
        assertEquals(1, jdbc.queryForObject("select count(*) from flyway_schema_history where version='1' and success", Integer.class));
        assertEquals(18, entityManagerFactory.getMetamodel().getEntities().size());
        assertEquals(1, jdbc.queryForObject("select count(*) from flyway_schema_history where version='3' and success", Integer.class));
        assertEquals("validate", environment.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("optional:file:van-moc-backend/.env[.properties],optional:file:.env[.properties]", environment.getProperty("spring.config.import"));
        assertEquals(1, jdbc.queryForObject("select count(*) from flyway_schema_history where script='R__seed_local_examples.sql' and success", Integer.class));
        verifyNoInteractions(source);
    }

    @Test
    void multipartUploadPersistsImagesAndPublishesThemToAdminAndStorefront() throws Exception {
        var admin = users.login("image-admin", "image-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var bytes = new byte[] {1, 2, 3, 4};
        var file = new org.springframework.mock.web.MockMultipartFile("file", "original.png", "image/png", bytes);
        when(s3.putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class))).thenAnswer(call -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            software.amazon.awssdk.services.s3.model.PutObjectRequest request = call.getArgument(0);
            software.amazon.awssdk.core.sync.RequestBody body = call.getArgument(1);
            assertEquals("test-product-images", request.bucket());
            assertEquals("image/png", request.contentType());
            assertDoesNotThrow(() -> UUID.fromString(request.key()));
            try (var stream = body.contentStreamProvider().newStream()) {
                assertArrayEquals(bytes, stream.readAllBytes());
            }
            return software.amazon.awssdk.services.s3.model.PutObjectResponse.builder().build();
        });
        mvc.perform(multipart("/api/admin/products/{id}/images", NO_IMAGE).file(file).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.primary").value(true))
                .andExpect(jsonPath("$.displayOrder").value(0))
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.startsWith("https://images.example.test/")));
        mvc.perform(multipart("/api/admin/products/{id}/images", NO_IMAGE).file(file).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.primary").value(false))
                .andExpect(jsonPath("$.displayOrder").value(1));
        mvc.perform(get("/api/admin/products/{id}", NO_IMAGE).with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(2));
        var saved = adminProducts.get(admin.id(), NO_IMAGE).images();
        assertEquals(2, saved.size());
        assertEquals(saved.getFirst().url(), products.getProductDetail(NO_IMAGE).images().getFirst().url());
        assertEquals(saved.getFirst().url(), products.getProducts(null, 0, 12).content().stream()
                .filter(p -> p.id().equals(NO_IMAGE)).findFirst().orElseThrow().imageUrl());
        var key = jdbc.queryForObject("select storage_key from product_images where id=?", String.class, saved.getFirst().id());
        assertEquals("https://images.example.test/" + key, saved.getFirst().url());
    }

    @Test
    void videosPersistWithoutBecomingProductThumbnailsAndFirstImageIsPrimary() throws Exception {
        var admin=users.login("media-admin","media-admin@example.test","Admin",null);
        jdbc.update("update users set role='ADMIN' where id=?",admin.id());
        var auth=org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        when(s3.putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class))).thenAnswer(call -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return software.amazon.awssdk.services.s3.model.PutObjectResponse.builder().build();
        });
        var video=new org.springframework.mock.web.MockMultipartFile("file","product.mp4","video/mp4",new byte[]{1,2,3});
        mvc.perform(multipart("/api/admin/products/{id}/images",NO_IMAGE).file(video).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.mediaType").value("VIDEO"))
                .andExpect(jsonPath("$.primary").value(false));
        assertNull(products.getProducts(null,0,12).content().stream().filter(p->p.id().equals(NO_IMAGE)).findFirst().orElseThrow().imageUrl());
        var image=productImages.upload(admin.id(),NO_IMAGE,new org.springframework.mock.web.MockMultipartFile("file","product.png","image/png",new byte[]{4,5}));
        assertTrue(image.primary());
        assertEquals("IMAGE",image.mediaType());
        assertEquals(1,image.displayOrder());
        assertEquals(image.url(),products.getProducts(null,0,12).content().stream().filter(p->p.id().equals(NO_IMAGE)).findFirst().orElseThrow().imageUrl());
        mvc.perform(get("/api/admin/products/{id}",NO_IMAGE).with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].mediaType").value("VIDEO"))
                .andExpect(jsonPath("$.images[1].primary").value(true));
        mvc.perform(get("/api/products/{id}",NO_IMAGE)).andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].mediaType").value("VIDEO"));
        var invalid=new org.springframework.mock.web.MockMultipartFile("file","document.txt","text/plain",new byte[]{1});
        mvc.perform(multipart("/api/admin/products/{id}/images",NO_IMAGE).file(invalid).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_PRODUCT_MEDIA"));
        assertEquals(2,adminProducts.get(admin.id(),NO_IMAGE).images().size());
        var request=org.mockito.ArgumentCaptor.forClass(software.amazon.awssdk.services.s3.model.PutObjectRequest.class);
        verify(s3,times(2)).putObject(request.capture(),any(software.amazon.awssdk.core.sync.RequestBody.class));
        assertEquals(List.of("video/mp4","image/png"),request.getAllValues().stream().map(software.amazon.awssdk.services.s3.model.PutObjectRequest::contentType).toList());
    }

    @Test
    void adminCanChoosePrimaryImageAndStorefrontUsesIt() throws Exception {
        var admin = users.login("primary-image-admin", "primary-image-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var buyer = users.login("primary-image-buyer", "primary-image-buyer@example.test", "Buyer", null);
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var buyerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        var images = adminProducts.get(admin.id(), PRODUCT).images();
        var first = images.get(0);
        var selected = images.get(1);

        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, selected.id()).with(buyerAuth).with(csrf))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, selected.id()).with(auth))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, UUID.randomUUID()).with(auth).with(csrf))
                .andExpect(status().isNotFound());
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", NO_IMAGE, selected.id()).with(auth).with(csrf))
                .andExpect(status().isNotFound());
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, first.id()).with(auth).with(csrf))
                .andExpect(status().isOk()).andExpect(jsonPath("$.primary").value(true));
        assertEquals(1, adminProducts.get(admin.id(), PRODUCT).images().stream().filter(com.vanmoc.product.dto.response.ProductImageResponse::primary).count());
        assertEquals(first.url(), products.getProducts(null, 0, 12).content().stream()
                .filter(p -> p.id().equals(PRODUCT)).findFirst().orElseThrow().imageUrl());
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, selected.id()).with(auth).with(csrf))
                .andExpect(status().isOk()).andExpect(jsonPath("$.primary").value(true));
        mvc.perform(get("/api/products/{id}", PRODUCT)).andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].primary").value(false))
                .andExpect(jsonPath("$.images[1].primary").value(true));
        assertEquals(selected.url(), products.getProducts(null, 0, 12).content().stream()
                .filter(p -> p.id().equals(PRODUCT)).findFirst().orElseThrow().imageUrl());
        assertEquals(1, jdbc.queryForObject("select count(*) from product_images where product_id=? and is_primary", Integer.class, PRODUCT));
    }

    @Test
    void publicProductSlugResolvesOnlyVisibleProductsAndKeepsIdEndpoint() throws Exception {
        var slug = jdbc.queryForObject("select slug from products where id=?", String.class, PRODUCT);
        mvc.perform(get("/api/products/by-slug/{slug}", slug)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PRODUCT.toString()))
                .andExpect(jsonPath("$.slug").value(slug));
        mvc.perform(get("/api/products/{id}", PRODUCT)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PRODUCT.toString()));
        mvc.perform(get("/api/products/by-slug/{slug}", "missing-product"))
                .andExpect(status().isNotFound());
        var hiddenId = jdbc.queryForObject("select id from products where active=false limit 1", UUID.class);
        var hiddenSlug = jdbc.queryForObject("select slug from products where id=?", String.class, hiddenId);
        mvc.perform(get("/api/products/by-slug/{slug}", hiddenSlug)).andExpect(status().isNotFound());
    }

    @Test
    void videoCannotBecomePrimaryImage() throws Exception {
        var admin = users.login("video-primary-admin", "video-primary-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var videoId = UUID.randomUUID();
        jdbc.update("insert into product_images(id, product_id, image_url, display_order, is_primary, media_type) values (?, ?, ?, ?, false, 'VIDEO')",
                videoId, PRODUCT, "/video.mp4", 10);
        mvc.perform(patch("/api/admin/products/{productId}/images/{imageId}/primary", PRODUCT, videoId).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_PRODUCT_MEDIA"));
        assertEquals(1, jdbc.queryForObject("select count(*) from product_images where product_id=? and is_primary", Integer.class, PRODUCT));
    }

    @Test
    void adminCanAddGoogleFontFromEmbed() throws Exception {
        var admin = users.login("google-font-admin", "google-font-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        var payload = "{\"name\":\"Be Vietnam Pro Bold\",\"url\":\"<link href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&display=swap' rel='stylesheet'>\"}";
        mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).contentType("application/json").content(payload))
                .andExpect(status().isForbidden());
        var result = mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).with(csrf)
                .contentType("application/json").content(payload))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.fontFamily").value("Be Vietnam Pro"))
                .andExpect(jsonPath("$.fontWeight").value(700))
                .andExpect(jsonPath("$.italic").value(false))
                .andExpect(jsonPath("$.cssUrl").value(org.hamcrest.Matchers.containsString("family=Be+Vietnam+Pro:wght@700")))
                .andReturn().getResponse().getContentAsString();
        var code = new tools.jackson.databind.json.JsonMapper().readTree(result).get("code").asText();
        mvc.perform(get("/api/engraving-fonts")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code=='" + code + "')]").exists());
        mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Evil\",\"url\":\"https://evil.example/css2?family=Evil\",\"weight\":500}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Unavailable\",\"url\":\"https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;1,500\",\"weight\":700,\"italic\":true}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Nghiêng\",\"url\":\"https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@1,500&display=swap\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.italic").value(true))
                .andExpect(jsonPath("$.fontWeight").value(500));
    }

    @Test
    void adminCanManageEngravingFonts() throws Exception {
        var admin = users.login("font-admin", "font-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        var buyer = users.login("font-buyer", "font-buyer@example.test", "Buyer", null);
        var buyerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));
        mvc.perform(get("/api/engraving-fonts")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code=='SERIF')]").exists());
        mvc.perform(get("/api/admin/engraving-fonts")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/engraving-fonts").with(buyerAuth)).andExpect(status().isForbidden());
        var file = new org.springframework.mock.web.MockMultipartFile("file", "new.ttf", "font/ttf", new byte[]{0, 1, 0, 0, 1, 2, 3, 4});
        mvc.perform(multipart("/api/admin/engraving-fonts").file(file).param("name", "Nét mới").with(auth).with(csrf))
                .andExpect(status().isForbidden());
        var result = mvc.perform(post("/api/admin/engraving-fonts/google").with(auth).with(csrf)
                .contentType("application/json").content("{\"name\":\"Nét mới\",\"url\":\"https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.active").value(true))
                .andReturn().getResponse().getContentAsString();
        var code = new tools.jackson.databind.json.JsonMapper().readTree(result).get("code").asText();
        mvc.perform(patch("/api/admin/engraving-fonts/{code}", code).with(auth).with(csrf)
                .contentType("application/json").content("{\"active\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/engraving-fonts")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code=='" + code + "')]").isEmpty());
        mvc.perform(get("/api/admin/engraving-fonts").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code=='" + code + "')]").exists());
    }

    @Test
    void adminCategoryCreateAndSafeDelete() throws Exception {
        var admin = users.login("category-admin", "category-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        var buyer = users.login("category-buyer", "category-buyer@example.test", "Buyer", null);
        var buyerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));

        mvc.perform(get("/api/admin/categories")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/categories").with(buyerAuth)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/categories").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("visible"));
        mvc.perform(post("/api/admin/categories").with(auth).contentType("application/json")
                .content("{\"name\":\"Lược gỗ\",\"slug\":\"luoc-go\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/categories").with(buyerAuth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Lược gỗ\",\"slug\":\"luoc-go\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/categories").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Lược gỗ\",\"slug\":\"LUOC GO\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        var created = mvc.perform(post("/api/admin/categories").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Lược gỗ\",\"slug\":\"luoc-go\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.slug").value("luoc-go"))
                .andReturn().getResponse().getContentAsString();
        var id = new tools.jackson.databind.json.JsonMapper().readTree(created).get("id").asText();
        mvc.perform(get("/api/categories")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.slug=='luoc-go')]").exists());
        mvc.perform(post("/api/admin/categories").with(auth).with(csrf).contentType("application/json")
                .content("{\"name\":\"Duplicate\",\"slug\":\"luoc-go\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("CATEGORY_SLUG_EXISTS"));
        mvc.perform(delete("/api/admin/categories/{id}", CATEGORY).with(auth).with(csrf))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("CATEGORY_HAS_PRODUCTS"));
        mvc.perform(delete("/api/admin/categories/{id}", UUID.fromString(id)).with(auth))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/categories/{id}", UUID.fromString(id)).with(auth).with(csrf))
                .andExpect(status().isNoContent());
        assertEquals(0, jdbc.queryForObject("select count(*) from categories where id=? and active", Integer.class, UUID.fromString(id)));
        mvc.perform(get("/api/categories")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.slug=='luoc-go')]").isEmpty());
        mvc.perform(delete("/api/admin/categories/{id}", UUID.fromString(id)).with(auth).with(csrf))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteProductRejectsHistoryAndAllowsUnreferencedDraft() throws Exception {
        var admin = users.login("delete-product-admin", "delete-product-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        jdbc.update("update products set stock=1 where id=?", PRODUCT);
        mvc.perform(delete("/api/admin/products/{id}?version=0", PRODUCT).with(auth).with(csrf))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PRODUCT_DELETE_HAS_HISTORY"));
        mvc.perform(delete("/api/admin/products/{id}?version=1", NO_IMAGE).with(auth).with(csrf))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PRODUCT_CHANGED"));
        mvc.perform(delete("/api/admin/products/{id}?version=0", NO_IMAGE).with(auth))
                .andExpect(status().isForbidden());
        var buyer = users.login("delete-product-buyer", "delete-product-buyer@example.test", "Buyer", null);
        var buyerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));
        mvc.perform(delete("/api/admin/products/{id}?version=0", NO_IMAGE).with(buyerAuth).with(csrf))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/products/{id}?version=0", NO_IMAGE).with(auth).with(csrf))
                .andExpect(status().isNoContent());
        assertEquals(0, jdbc.queryForObject("select count(*) from products where id=?", Integer.class, NO_IMAGE));
        mvc.perform(get("/api/products/{id}", NO_IMAGE)).andExpect(status().isNotFound());
    }

    @Test
    void deleteProductKeepsCartAndStockHistoryAndCleansImagesOnlyAfterCommit() throws Exception {
        var admin = users.login("delete-references-admin", "delete-references-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var csrf = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf();
        var cartId = UUID.randomUUID();
        jdbc.update("insert into carts(id, user_id) values (?, ?)", cartId, admin.id());
        jdbc.update("insert into cart_items(id, cart_id, product_id, quantity) values (?, ?, ?, 1)", UUID.randomUUID(), cartId, PRODUCT);
        mvc.perform(delete("/api/admin/products/{id}?version=0", PRODUCT).with(auth).with(csrf))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PRODUCT_DELETE_IN_CART"));
        assertEquals(1, jdbc.queryForObject("select count(*) from cart_items where product_id=?", Integer.class, PRODUCT));
        jdbc.update("delete from cart_items where product_id=?", PRODUCT);
        jdbc.update("insert into stock_movements(id, product_id, quantity_change, reason) values (?, ?, 1, 'ADJUSTMENT')", UUID.randomUUID(), PRODUCT);
        mvc.perform(delete("/api/admin/products/{id}?version=0", PRODUCT).with(auth).with(csrf))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PRODUCT_DELETE_HAS_HISTORY"));
        assertEquals(1, jdbc.queryForObject("select count(*) from stock_movements where product_id=?", Integer.class, PRODUCT));
        verify(s3, never()).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));

        var imageId = UUID.randomUUID();
        jdbc.update("insert into product_images(id, product_id, image_url, storage_key, display_order, is_primary) values (?, ?, '/owned.jpg', 'delete-owned-key', 0, true)", imageId, NO_IMAGE);
        doAnswer(invocation -> {
            // The callback runs before Spring clears thread-bound transaction metadata;
            // use a separate connection to verify the database commit is visible.
            try (var connection = java.sql.DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
                 var statement = connection.prepareStatement("select count(*) from products where id=?")) {
                statement.setObject(1, NO_IMAGE);
                try (var result = statement.executeQuery()) {
                    assertTrue(result.next());
                    assertEquals(0, result.getInt(1));
                }
            }
            return null;
        }).when(s3).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));
        mvc.perform(delete("/api/admin/products/{id}?version=0", NO_IMAGE).with(auth).with(csrf))
                .andExpect(status().isNoContent());
        assertEquals(0, jdbc.queryForObject("select count(*) from product_images where id=?", Integer.class, imageId));
        verify(s3).deleteObject(org.mockito.ArgumentMatchers.<software.amazon.awssdk.services.s3.model.DeleteObjectRequest>argThat(
                request -> request.key().equals("delete-owned-key")));
    }

    @Test
    void uploadHonorsAdminAndCsrfAndDoesNotSaveWhenS3Fails() throws Exception {
        var buyer = users.login("image-buyer", "image-buyer@example.test", "Buyer", null);
        var admin = users.login("image-admin", "image-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        var buyerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));
        var file = new org.springframework.mock.web.MockMultipartFile("file", "image.png", "image/png", new byte[] {1});
        mvc.perform(multipart("/api/admin/products/{id}/images", NO_IMAGE).file(file).with(auth))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/api/admin/products/{id}/images", NO_IMAGE).file(file).with(buyerAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/api/admin/products/{id}/images", UUID.randomUUID()).file(file).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound());
        verifyNoInteractions(s3);
        when(s3.putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class)))
                .thenThrow(software.amazon.awssdk.services.s3.model.S3Exception.builder().statusCode(503).message("Unavailable").build());
        mvc.perform(multipart("/api/admin/products/{id}/images", NO_IMAGE).file(file).with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadGateway()).andExpect(jsonPath("$.code").value("PRODUCT_IMAGE_UPLOAD_FAILED"));
        assertEquals(0, jdbc.queryForObject("select count(*) from product_images where product_id=?", Integer.class, NO_IMAGE));
    }

    @Test
    void concurrentUploadsKeepOnePrimaryAndDistinctDisplayOrders() throws Exception {
        var admin = users.login("concurrent-image-admin", "concurrent-image-admin@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var barrier = new java.util.concurrent.CyclicBarrier(2);
        when(s3.putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class))).thenAnswer(call -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            barrier.await(10, java.util.concurrent.TimeUnit.SECONDS);
            return software.amazon.awssdk.services.s3.model.PutObjectResponse.builder().build();
        });
        try (var pool = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<com.vanmoc.product.dto.response.ProductImageResponse> upload = () ->
                    productImages.upload(admin.id(), NO_IMAGE,
                            new org.springframework.mock.web.MockMultipartFile("file", "image.png", "image/png", new byte[] {1}));
            var first = pool.submit(upload);
            var second = pool.submit(upload);
            first.get(20, java.util.concurrent.TimeUnit.SECONDS);
            second.get(20, java.util.concurrent.TimeUnit.SECONDS);
        }
        var saved = adminProducts.get(admin.id(), NO_IMAGE).images();
        assertEquals(List.of(0, 1), saved.stream().map(com.vanmoc.product.dto.response.ProductImageResponse::displayOrder).toList());
        assertEquals(1, saved.stream().filter(com.vanmoc.product.dto.response.ProductImageResponse::primary).count());
    }

    @Test
    void visibilityCategoryPaginationAndBatchImages() {
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        var page = products.getProducts(null, 0, 12);
        assertEquals(3, page.totalElements());
        assertEquals(List.of(NO_IMAGE, FALLBACK, PRODUCT), page.content().stream().map(p -> p.id()).toList());
        assertNull(page.content().get(0).imageUrl());
        assertEquals("/fallback.jpg", page.content().get(1).imageUrl());
        assertEquals("/primary.jpg", page.content().get(2).imageUrl());
        assertEquals(0, page.content().get(2).stock());
        assertTrue(statistics.getPrepareStatementCount() <= 3, "Page/count + one batch; no N+1");
        var filtered = products.getProducts(CATEGORY, 0, 1);
        assertEquals(2, filtered.totalElements());
        assertEquals(2, filtered.totalPages());
        assertEquals(FALLBACK, filtered.content().getFirst().id());
        assertEquals(PRODUCT, products.getProducts(CATEGORY, 1, 1).content().getFirst().id());
        assertTrue(products.getProducts(CATEGORY, 2, 1).content().isEmpty());
        assertTrue(products.getProducts(UUID.randomUUID(), 0, 12).content().isEmpty());
        assertEquals(2, products.getCategories().size());
    }

    @Test
    void detailMapsOrderedImagesFontsAndEffectiveEngravingLimits() {
        var detail = products.getProductDetail(PRODUCT);
        assertEquals(List.of("/first.jpg", "/primary.jpg"), detail.images().stream().map(i -> i.url()).toList());
        assertEquals(List.of("SERIF", "SCRIPT"), detail.engraving().fonts());
        assertEquals(List.of(12, 8, 12), detail.engraving().positions().stream().map(p -> p.maxChars()).toList());
        jdbc.update("update products set engraving_enabled=false where id=?", PRODUCT);
        assertTrue(products.getProductDetail(PRODUCT).engraving().positions().isEmpty());
        assertTrue(products.getProductDetail(PRODUCT).engraving().fonts().isEmpty());
    }

    @Test
    void fullPageCountsAndEmptyPagesKeepQueryBudget() {
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        var page = products.getProducts(null, 0, 2);
        assertEquals(3, page.totalElements());
        assertEquals(2, page.totalPages());
        assertEquals(List.of(NO_IMAGE, FALLBACK), page.content().stream().map(p -> p.id()).toList());
        assertEquals(3, statistics.getPrepareStatementCount(), "Product page, count and one image batch");

        statistics.clear();
        var empty = products.getProducts(null, 2, 2);
        assertTrue(empty.content().isEmpty());
        assertEquals(3, empty.totalElements());
        assertEquals(2, statistics.getPrepareStatementCount(), "Empty page must not query images");
    }

    @Test
    void subjectIdentityAddressOwnershipAndDefaultArePersisted() {
        var first = users.login("subject-a", "a@example.test", "User A", null);
        var same = users.login("subject-a", "a@example.test", "Updated A", null);
        assertEquals(first.id(), same.id());
        assertEquals("User A", users.me(first.id()).fullName(), "Google login preserves the stored profile name");
        assertThrows(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class,
                () -> users.login("different-subject", "a@example.test", "Must not merge", null));
        var second = users.login("subject-b", "b@example.test", "User B", null);
        importer.importDataset(dataset("Province", 1));
        var request = new com.vanmoc.user.dto.request.AddressRequest("Home", "Recipient", "0901234567", 10, "Street", true);
        var home = addresses.save(first.id(), null, request);
        assertEquals(1, home.provinceCode());
        assertEquals("Province", home.provinceName());
        assertTrue(addresses.list(second.id()).isEmpty());
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class, () -> addresses.save(second.id(), home.id(), request));
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class, () -> addresses.delete(second.id(), home.id()));
        var other = addresses.save(first.id(), null, request);
        assertEquals(1, addresses.list(first.id()).stream().filter(a -> a.isDefault()).count());
        assertTrue(addresses.list(first.id()).stream().filter(a -> a.id().equals(other.id())).findFirst().orElseThrow().isDefault());
        jdbc.update("update users set active=false where id=?", first.id());
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> addresses.list(first.id()));
        assertThrows(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class,
                () -> users.login("subject-a", "a@example.test", "Inactive", null));
    }

    @Test
    void csrfAndAuthenticationAreRequiredForAccountMutations() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
        mvc.perform(get("/api/addresses")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andExpect(jsonPath("$.token").isString());
        mvc.perform(post("/api/addresses").contentType("application/json").content("{}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        mvc.perform(post("/api/auth/logout")).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void googleAuthorizationUsesThreeSeparateScopes() throws Exception {
        assertEquals(java.util.Set.of("openid", "profile", "email"),
                clientRegistrations.findByRegistrationId("google").getScopes());
        var response = mvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection()).andReturn().getResponse();
        var redirect = response.getRedirectedUrl();
        assertNotNull(redirect);
        var query = java.net.URI.create(redirect).getRawQuery();
        var scope = java.util.Arrays.stream(query.split("&")).filter(value -> value.startsWith("scope="))
                .findFirst().orElseThrow().substring("scope=".length());
        var decoded = java.net.URLDecoder.decode(scope, java.nio.charset.StandardCharsets.UTF_8);
        assertEquals(java.util.Set.of("openid", "profile", "email"), java.util.Set.of(decoded.split(" ")));
    }

    @Test
    void jdbcSessionRestoresSerializedIdentityFromCookieAndLogoutDeletesIt() throws Exception {
        var sessions = sessionRepository();
        var owner = users.login("jdbc-session", "jdbc-session@example.test", "Session Owner", null);
        var csrfResult = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        var cookie = csrfResult.getResponse().getCookie("JSESSIONID");
        assertNotNull(cookie);
        assertTrue(cookie.isHttpOnly());
        var sessionId = new String(java.util.Base64.getDecoder().decode(cookie.getValue()), java.nio.charset.StandardCharsets.UTF_8);
        var session = sessions.findById(sessionId);
        assertNotNull(session);
        assertEquals(1800, session.getMaxInactiveInterval().getSeconds());
        var principal = com.vanmoc.user.service.OidcTestIdentity.principal(owner.id());
        var context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "google"));
        session.setAttribute(org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        sessions.save(session);
        // Each request restores the persisted SecurityContext; no mock login or MockHttpSession is supplied.
        mvc.perform(get("/api/me").cookie(cookie)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(owner.id().toString()));
        assertEquals(owner.id().toString(), jdbc.queryForObject("select principal_name from spring_session where session_id=?", String.class, sessionId));
        assertTrue(jdbc.queryForObject("select count(*) from spring_session_attributes a join spring_session s on a.session_primary_id=s.primary_id where s.session_id=?", Integer.class, sessionId) > 0);
        var csrf = mvc.perform(get("/api/auth/csrf").cookie(cookie)).andExpect(status().isOk()).andReturn();
        var token = (org.springframework.security.web.csrf.CsrfToken) csrf.getRequest().getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
        mvc.perform(post("/api/auth/logout").cookie(cookie).header(token.getHeaderName(), token.getToken()))
                .andExpect(status().isNoContent());
        assertNull(sessions.findById(sessionId));
        assertEquals(0, jdbc.queryForObject("select count(*) from spring_session_attributes", Integer.class));
        mvc.perform(get("/api/me").cookie(cookie)).andExpect(status().isUnauthorized());
    }

    @Test
    void expiredJdbcSessionIsRejectedAndCleanupRemovesAttributes() throws Exception {
        var sessions = sessionRepository();
        var session = sessions.createSession();
        session.setAttribute("test-marker", "persisted");
        sessions.save(session);
        assertEquals("persisted", sessions.findById(session.getId()).getAttribute("test-marker"));
        jdbc.update("update spring_session set last_access_time=0, expiry_time=0 where session_id=?", session.getId());
        var cookie = new jakarta.servlet.http.Cookie("JSESSIONID", java.util.Base64.getEncoder()
                .encodeToString(session.getId().getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        mvc.perform(get("/api/me").cookie(cookie)).andExpect(status().isUnauthorized());
        assertNull(sessions.findById(session.getId()));
        jdbcSessions.cleanUpExpiredSessions();
        assertEquals(0, jdbc.queryForObject("select count(*) from spring_session where session_id=?", Integer.class, session.getId()));
        assertEquals(0, jdbc.queryForObject("select count(*) from spring_session_attributes where attribute_name='test-marker'", Integer.class));
    }

    @Test
    void legacyAndMalformedSessionCookiesNeverReachPostgresAsInvalidText() throws Exception {
        for (String value : List.of(
                "00000000000000000000000000000000", // old Tomcat-shaped hex ID, Base64 decodes to NULs
                java.util.Base64.getEncoder().encodeToString("bad\u0000session".getBytes(java.nio.charset.StandardCharsets.UTF_8)),
                java.util.Base64.getEncoder().encodeToString("not-a-uuid".getBytes(java.nio.charset.StandardCharsets.UTF_8)),
                "!invalid-base64!")) {
            var cookie = new jakarta.servlet.http.Cookie("JSESSIONID", value);
            mvc.perform(get("/api/me").cookie(cookie)).andExpect(status().isUnauthorized());
            var response = mvc.perform(get("/api/auth/csrf").cookie(cookie))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.token").isString()).andReturn().getResponse();
            assertNotNull(response.getCookie("JSESSIONID"));
            assertNotEquals(value, response.getCookie("JSESSIONID").getValue());
        }
    }

    private String webhookSignature(String timestamp, String body) throws Exception {
        var mac = javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(new javax.crypto.spec.SecretKeySpec("integration-hmac-secret".getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
        return "sha256=" + java.util.HexFormat.of().formatHex(mac.doFinal((timestamp + "." + body).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    @Test
    void checkoutSnapshotsPricesReservesStockAndRetriesWithoutDuplicateOrder() {
        var user=users.login("checkout", "checkout@example.test", "Buyer", null);
        importer.importDataset(dataset("Province",1));
        var address=addresses.save(user.id(),null,new com.vanmoc.user.dto.request.AddressRequest("Home","Recipient","0901234567",10,"Street",true));
        jdbc.update("update products set stock=5 where id=?",PRODUCT);
        var config=new com.vanmoc.cart.dto.request.CartItemRequest.EngravingRequest("An","SCRIPT",com.vanmoc.product.enums.EngravingPosition.FRONT);
        var row=cart.add(user.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,2,config)).items().getFirst();
        var request=new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,null,"checkout-key");
        var preview=checkout.checkout(user.id(),request,false);
        assertEquals(0,preview.grandTotal().compareTo(new java.math.BigDecimal("770000")));
        assertEquals(5,jdbc.queryForObject("select stock from products where id=?",Integer.class,PRODUCT));
        var created=checkout.checkout(user.id(),request,true);
        assertTrue(created.orderCode().matches("VM[0-9A-F]{8}"));
        assertEquals("Street",orderReads.detail(user.id(),created.orderId()).addressLine());
        assertEquals(1,orderReads.list(user.id(),0).getTotalElements());
        var outsider=users.login("checkout-outsider","checkout-outsider@example.test","Other",null);
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class,()->orderReads.detail(outsider.id(),created.orderId()));
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class,()->lifecycle.cancel(outsider.id(),created.orderId()));
        assertEquals(created.orderId(),checkout.checkout(user.id(),request,true).orderId());
        assertEquals(3,jdbc.queryForObject("select stock from products where id=?",Integer.class,PRODUCT));
        assertEquals(1,jdbc.queryForObject("select count(*) from orders",Integer.class));
        assertEquals(1,jdbc.queryForObject("select count(*) from stock_movements",Integer.class));
        assertTrue(cart.get(user.id()).items().isEmpty());
        assertEquals("An",jdbc.queryForObject("select engraving_text from order_items where order_id=?",String.class,created.orderId()));
        jdbc.update("update products set price=1,name='Changed' where id=?",PRODUCT);
        jdbc.update("update addresses set address_line='Changed' where id=?",address.id());
        assertEquals("Street",jdbc.queryForObject("select shipping_address_line from orders where id=?",String.class,created.orderId()));
        assertEquals(0,jdbc.queryForObject("select unit_price from order_items where order_id=?",java.math.BigDecimal.class,created.orderId()).compareTo(new java.math.BigDecimal("320000")));
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->checkout.checkout(user.id(),new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,"changed","checkout-key"),true));
        lifecycle.cancel(user.id(), created.orderId());
        lifecycle.cancel(user.id(), created.orderId());
        assertEquals(5,jdbc.queryForObject("select stock from products where id=?",Integer.class,PRODUCT));
        assertEquals(2,jdbc.queryForObject("select count(*) from stock_movements",Integer.class));
    }

    @Test
    void bankExpiryRestoresOnceAndCodCompletionRequiresAdminCollection() {
        var user=users.login("lifecycle", "lifecycle@example.test", "Buyer", null);
        var admin=users.login("admin-lifecycle", "admin-lifecycle@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?",admin.id());
        importer.importDataset(dataset("Province",1));
        var address=addresses.save(user.id(),null,new com.vanmoc.user.dto.request.AddressRequest("Home","Recipient","0901234567",10,"Street",true));
        jdbc.update("update products set stock=5 where id=?",PRODUCT);
        var row=cart.add(user.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
        var bank=checkout.checkout(user.id(),new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.BANK_TRANSFER,null,"bank-expiry"),true);
        jdbc.update("update payments set expires_at=now()-interval '1 minute' where order_id=?",bank.orderId());
        lifecycle.expire(bank.orderId()); lifecycle.expire(bank.orderId());
        assertEquals(5,jdbc.queryForObject("select stock from products where id=?",Integer.class,PRODUCT));
        assertEquals("EXPIRED",jdbc.queryForObject("select status from payments where order_id=?",String.class,bank.orderId()));
        row=cart.add(user.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
        var cod=checkout.checkout(user.id(),new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,null,"cod-lifecycle"),true);
        assertEquals(2,adminOrders.list(admin.id(),"",null,null,0).getTotalElements());
        assertEquals(1,adminOrders.list(admin.id(),cod.orderCode(),com.vanmoc.order.enums.OrderStatus.PENDING_CONFIRMATION,com.vanmoc.payment.enums.PaymentMethod.COD,0).getTotalElements());
        assertEquals(0,adminOrders.list(admin.id(),cod.orderCode(),null,com.vanmoc.payment.enums.PaymentMethod.BANK_TRANSFER,0).getTotalElements());
        assertEquals("Street",adminOrders.detail(admin.id(),cod.orderId()).order().addressLine());
        assertEquals(com.vanmoc.payment.enums.PaymentStatus.PENDING,adminOrders.detail(admin.id(),cod.orderId()).paymentStatus());
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->adminOrders.list(user.id(),"",null,null,0));
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->adminOrders.detail(user.id(),cod.orderId()));
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->lifecycle.advance(user.id(),cod.orderId(),com.vanmoc.order.enums.OrderStatus.CONFIRMED,false));
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->lifecycle.advance(admin.id(),cod.orderId(),com.vanmoc.order.enums.OrderStatus.SHIPPING,false));
        for(var state:List.of(com.vanmoc.order.enums.OrderStatus.CONFIRMED,com.vanmoc.order.enums.OrderStatus.PROCESSING,com.vanmoc.order.enums.OrderStatus.READY_TO_SHIP,com.vanmoc.order.enums.OrderStatus.SHIPPING))
            lifecycle.advance(admin.id(),cod.orderId(),state,false);
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->lifecycle.advance(admin.id(),cod.orderId(),com.vanmoc.order.enums.OrderStatus.COMPLETED,false));
        lifecycle.advance(admin.id(),cod.orderId(),com.vanmoc.order.enums.OrderStatus.COMPLETED,true);
        assertEquals("PAID",jdbc.queryForObject("select status from payments where order_id=?",String.class,cod.orderId()));
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->lifecycle.cancel(user.id(),cod.orderId()));
    }

    @Test
    void adminDashboardPrioritizesPendingAcrossPagesAndReportsActualPayments() throws Exception {
        var buyer=users.login("dashboard-buyer","dashboard-buyer@example.test","Buyer",null);
        var admin=users.login("dashboard-admin","dashboard-admin@example.test","Admin",null);
        jdbc.update("update users set role='ADMIN' where id=?",admin.id());
        importer.importDataset(dataset("Province",1));
        var address=addresses.save(buyer.id(),null,new com.vanmoc.user.dto.request.AddressRequest("Home","Recipient","0901234567",10,"Street",true));
        jdbc.update("update products set stock=30 where id=?",PRODUCT);
        UUID pendingId=null;
        for (int index=0;index<22;index++) {
            var item=cart.add(buyer.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
            var order=checkout.checkout(buyer.id(),new com.vanmoc.order.dto.request.CheckoutRequest(List.of(item.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,null,"dashboard-"+index),true);
            if (index==0) {
                pendingId=order.orderId();
                jdbc.update("update orders set created_at=now()-interval '1 day' where id=?",pendingId);
            } else if (index==1) lifecycle.cancel(buyer.id(),order.orderId());
            else lifecycle.advance(admin.id(),order.orderId(),com.vanmoc.order.enums.OrderStatus.CONFIRMED,false);
        }
        var item=cart.add(buyer.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
        var bank=checkout.checkout(buyer.id(),new com.vanmoc.order.dto.request.CheckoutRequest(List.of(item.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.BANK_TRANSFER,null,"dashboard-bank"),true);
        var firstPage=adminOrders.list(admin.id(),"",null,null,0);
        assertEquals(23,firstPage.getTotalElements());
        assertEquals(2,firstPage.getTotalPages());
        assertEquals(pendingId,firstPage.getContent().getFirst().id());
        assertEquals(com.vanmoc.payment.enums.PaymentStatus.PENDING,firstPage.getContent().getFirst().paymentStatus());
        var bankRow=adminOrders.list(admin.id(),bank.orderCode(),null,null,0).getContent().getFirst();
        assertEquals(com.vanmoc.order.enums.OrderStatus.PENDING_PAYMENT,bankRow.status());
        assertEquals(com.vanmoc.payment.enums.PaymentStatus.PENDING,bankRow.paymentStatus());
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->lifecycle.advance(admin.id(),bank.orderId(),com.vanmoc.order.enums.OrderStatus.CONFIRMED,false));
        assertEquals(3,adminOrders.list(admin.id(),"",null,null,1).getNumberOfElements());
        var auth=org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        mvc.perform(get("/api/admin/orders/stats").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(23)).andExpect(jsonPath("$.pendingConfirmation").value(1))
                .andExpect(jsonPath("$.cancelled").value(1));
        mvc.perform(get("/api/admin/orders").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(pendingId.toString()))
                .andExpect(jsonPath("$.content[0].paymentStatus").value("PENDING"));
        mvc.perform(get("/api/admin/orders/stats")).andExpect(status().isUnauthorized());
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->adminOrders.stats(buyer.id()));
        lifecycle.advance(admin.id(),pendingId,com.vanmoc.order.enums.OrderStatus.CONFIRMED,false);
        assertEquals(0,adminOrders.stats(admin.id()).pendingConfirmation());
    }

    @Test
    void provinceShippingIsAdminControlledAndExistingOrdersKeepSnapshot() throws Exception {
        var buyer=users.login("shipping-buyer","shipping-buyer@example.test","Buyer",null);
        var admin=users.login("shipping-admin","shipping-admin@example.test","Admin",null);
        jdbc.update("update users set role='ADMIN' where id=?",admin.id());
        importer.importDataset(dataset("Province",1));
        var address=addresses.save(buyer.id(),null,new com.vanmoc.user.dto.request.AddressRequest("Home","Recipient","0901234567",10,"Street",true));
        jdbc.update("update products set stock=5 where id=?",PRODUCT);
        var row=cart.add(buyer.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
        var request=new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,null,"shipping-key");
        assertEquals(0,checkout.checkout(buyer.id(),request,false).shippingFee().compareTo(new java.math.BigDecimal("30000")));
        shippingRates.set(admin.id(),1,new java.math.BigDecimal("45000"));
        assertEquals(0,checkout.checkout(buyer.id(),request,false).shippingFee().compareTo(new java.math.BigDecimal("45000")));
        var order=checkout.checkout(buyer.id(),request,true);
        shippingRates.set(admin.id(),1,new java.math.BigDecimal("60000"));
        assertEquals(0,orderReads.detail(buyer.id(),order.orderId()).shippingFee().compareTo(new java.math.BigDecimal("45000")));
        shippingRates.set(admin.id(),0,new java.math.BigDecimal("35000"));
        shippingRates.reset(admin.id(),1);
        assertEquals(0,shippingRates.feeFor(1).compareTo(new java.math.BigDecimal("35000")));
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->shippingRates.set(buyer.id(),1,java.math.BigDecimal.ZERO));
        var buyerAuth=org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(buyer.id()));
        var adminAuth=org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        mvc.perform(get("/api/admin/shipping").with(buyerAuth)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/shipping").with(adminAuth)).andExpect(status().isOk()).andExpect(jsonPath("$.defaultFee").value(35000));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/admin/shipping/1").with(adminAuth)
                .contentType("application/json").content("{\"fee\":0}")).andExpect(status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/admin/shipping/1").with(adminAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"fee\":-1}")).andExpect(status().isBadRequest());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/admin/shipping/1").with(adminAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"fee\":0.5}")).andExpect(status().isBadRequest());
        shippingRates.set(admin.id(),1,java.math.BigDecimal.ZERO);
        assertEquals(0,shippingRates.feeFor(1).signum());
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class,()->shippingRates.set(admin.id(),999999,java.math.BigDecimal.ZERO));
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->shippingRates.reset(admin.id(),0));
    }

    @Test
    void adminPasswordLoginIssuesJwtAndBootstrapNeverResetsPassword() throws Exception {
        adminInitializer.run(null);
        var hash=jdbc.queryForObject("select password_hash from users where username='admin'",String.class);
        assertTrue(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches("vanmoc@2026",hash));
        adminInitializer.run(null);
        assertEquals(hash,jdbc.queryForObject("select password_hash from users where username='admin'",String.class));
        mvc.perform(post("/api/admin/login").param("username","admin").param("password","vanmoc@2026"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/login").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .param("username","admin").param("password","wrong")).andExpect(status().isUnauthorized());
        var result=mvc.perform(post("/api/admin/login").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .param("username","admin").param("password","vanmoc@2026")).andExpect(status().isNoContent()).andReturn();
        var cookie=result.getResponse().getCookie("VM_ADMIN");
        assertNotNull(cookie);
        assertTrue(cookie.isHttpOnly());
        assertNull(result.getResponse().getCookie("JSESSIONID"));
        mvc.perform(get("/api/admin/me").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(get("/api/admin/shipping").cookie(cookie)).andExpect(status().isOk());
        mvc.perform(get("/api/admin/orders").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/me").cookie(cookie)).andExpect(status().isUnauthorized());
        jdbc.update("delete from spring_session_attributes");
        jdbc.update("delete from spring_session");
        mvc.perform(get("/api/admin/me").cookie(cookie)).andExpect(status().isOk());
        mvc.perform(patch("/api/admin/engraving-fonts/SERIF").cookie(cookie)
                .contentType("application/json").content("{\"active\":false}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/engraving-fonts/SERIF").cookie(cookie)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"active\":false}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/me").cookie(new jakarta.servlet.http.Cookie("VM_ADMIN", "invalid")))
                .andExpect(status().isUnauthorized());
        var customer = users.login("jwt-customer", "jwt-customer@example.test", "Customer", null);
        var customerCookie = new jakarta.servlet.http.Cookie("VM_ADMIN", jwt.issue(customer.id()));
        mvc.perform(get("/api/admin/me").cookie(customerCookie)).andExpect(status().isUnauthorized());
        var logout = mvc.perform(post("/api/auth/logout").cookie(cookie)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent()).andReturn();
        assertEquals(0, logout.getResponse().getCookie("VM_ADMIN").getMaxAge());
        var changedHash=new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("changed-password");
        jdbc.update("update users set password_hash=? where username='admin'",changedHash);
        adminInitializer.run(null);
        assertEquals(changedHash,jdbc.queryForObject("select password_hash from users where username='admin'",String.class));
        jdbc.update("update users set active=false where username='admin'");
        mvc.perform(get("/api/admin/shipping").cookie(cookie)).andExpect(status().isForbidden());
        adminInitializer.run(null);
        assertEquals(false,jdbc.queryForObject("select active from users where username='admin'",Boolean.class));
    }

    @Test
    void adminProductEditingAndStockAdjustmentsAreAuditedAndRejectStaleWrites() {
        var admin=users.login("product-admin","product-admin@example.test","Admin",null);
        var buyer=users.login("product-buyer","product-buyer@example.test","Buyer",null);
        jdbc.update("update users set role='ADMIN' where id=?",admin.id());
        var existing=adminProducts.get(admin.id(),PRODUCT);
        var r=existing.details();
        var request=new com.vanmoc.product.dto.request.AdminProductRequest(r.categoryId(),"NEW-CODE","new-product","New product","Short","Description","Horn",new java.math.BigDecimal("100000"),true,true,30,new java.math.BigDecimal("20000"),List.of("SCRIPT"),List.of(new com.vanmoc.product.dto.request.AdminProductRequest.Position(com.vanmoc.product.enums.EngravingPosition.FRONT,20)),0L);
        var created=adminProducts.save(admin.id(),null,request);
        assertEquals(0,created.stock());
        assertEquals(1,adminProducts.list(admin.id(),"NEW-CODE",null,true,true,0).getTotalElements());
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->adminProducts.get(buyer.id(),created.id()));
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->adminInventory.adjust(buyer.id(),created.id(),new com.vanmoc.inventory.dto.request.StockAdjustmentRequest(1,"Not permitted")));
        assertEquals(5,adminInventory.adjust(admin.id(),created.id(),new com.vanmoc.inventory.dto.request.StockAdjustmentRequest(5,"Restock")));
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->adminInventory.adjust(admin.id(),created.id(),new com.vanmoc.inventory.dto.request.StockAdjustmentRequest(-6,"Invalid")));
        assertEquals(1,adminInventory.history(admin.id(),created.id(),0).getTotalElements());
        assertEquals(admin.id(),adminInventory.history(admin.id(),created.id(),0).getContent().getFirst().changedByUserId());
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->adminProducts.save(admin.id(),created.id(),created.details()));
        var fresh=adminProducts.get(admin.id(),created.id());
        assertEquals(5,adminProducts.save(admin.id(),created.id(),fresh.details()).stock());
        assertEquals(1,adminProducts.get(admin.id(),created.id()).details().fonts().size());
        assertThrows(com.vanmoc.shared.exception.RuleException.class,()->adminProducts.save(admin.id(),null,request));
        assertEquals(5,adminProducts.get(admin.id(),created.id()).stock());
    }

    @Test
    void competingCheckoutsCannotSellLastProductTwice() throws Exception {
        importer.importDataset(dataset("Province",1));
        jdbc.update("update products set stock=1 where id=?",PRODUCT);
        var requests=new java.util.ArrayList<java.util.concurrent.Callable<Boolean>>();
        var start=new java.util.concurrent.CountDownLatch(1);
        for(int index=0;index<2;index++){
            var user=users.login("race"+index,"race"+index+"@example.test","Buyer",null);
            var address=addresses.save(user.id(),null,new com.vanmoc.user.dto.request.AddressRequest("Home","Recipient","0901234567",10,"Street",true));
            var row=cart.add(user.id(),new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT,1,null)).items().getFirst();
            var request=new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()),address.id(),com.vanmoc.payment.enums.PaymentMethod.COD,null,"race-key");
            requests.add(()->{start.await();try{checkout.checkout(user.id(),request,true);return true;}catch(com.vanmoc.shared.exception.RuleException exception){assertEquals("INSUFFICIENT_STOCK",exception.getCode());return false;}});
        }
        try(var executor=java.util.concurrent.Executors.newFixedThreadPool(2)){
            var first=executor.submit(requests.get(0));var second=executor.submit(requests.get(1));start.countDown();
            assertNotEquals(first.get(15,java.util.concurrent.TimeUnit.SECONDS),second.get(15,java.util.concurrent.TimeUnit.SECONDS));
        }
        assertEquals(0,jdbc.queryForObject("select stock from products where id=?",Integer.class,PRODUCT));
        assertEquals(1,jdbc.queryForObject("select count(*) from orders",Integer.class));
        assertEquals(1,jdbc.queryForObject("select count(*) from cart_items",Integer.class));
    }

    @Test
    void sepayVerifiedWebhookPaysOnceAndAbnormalMoneyRequiresReconciliation() throws Exception {
        var user = users.login("sepay", "sepay@example.test", "Buyer", null);
        var order = UUID.randomUUID(); var payment = UUID.randomUUID();
        jdbc.update("insert into orders(id, user_id, order_code, status, payment_method, version) values (?, ?, 'VMTEST', 'PENDING_PAYMENT', 'BANK_TRANSFER', 0)", order, user.id());
        jdbc.update("insert into payments(id,order_id,method,provider,status,expected_amount,transfer_code,expires_at,version) values (?,?,'BANK_TRANSFER','SEPAY','PENDING',100000,'VMTEST',now()+interval '15 minutes',0)", payment, order);
        String timestamp = Long.toString(java.time.Instant.now().getEpochSecond());
        String body = """
                {"id":123,"gateway":"Vietcombank","accountNumber":"123456789","code":"VMTEST","transferType":"in","transferAmount":100000}
                """;
        mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body))
                .andExpect(status().isUnauthorized());
        for (int i = 0; i < 2; i++) mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body)
                .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, body)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        assertEquals("PAID", jdbc.queryForObject("select status from payments where id=?", String.class, payment));
        assertEquals("PENDING_CONFIRMATION", jdbc.queryForObject("select status from orders where id=?", String.class, order));
        assertEquals(1, jdbc.queryForObject("select count(*) from order_status_history where order_id=?", Integer.class, order));
        String second = body.replace("123,", "124,");
        mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(second)
                .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, second)))
                .andExpect(status().isOk());
        assertEquals("REJECTED", jdbc.queryForObject("select processing_status from payment_webhook_events where provider_event_id='124'", String.class));
        String stale = Long.toString(java.time.Instant.now().minusSeconds(600).getEpochSecond());
        mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body)
                .header("X-SePay-Timestamp", stale).header("X-SePay-Signature", webhookSignature(stale, body)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body + " ")
                .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sepayRejectsWrongAmountAccountDirectionAndLatePaymentAndProtectsQrOwnership() throws Exception {
        var user = users.login("qr", "qr@example.test", "Buyer", null);
        var outsider = users.login("qr-other", "qr-other@example.test", "Other", null);
        var order = UUID.randomUUID(); var payment = UUID.randomUUID();
        jdbc.update("insert into orders(id,user_id,order_code,status,payment_method,version) values (?,?,'VMQR','PENDING_PAYMENT','BANK_TRANSFER',0)", order, user.id());
        jdbc.update("insert into payments(id,order_id,method,provider,status,expected_amount,transfer_code,expires_at,version) values (?,?,'BANK_TRANSFER','SEPAY','PENDING',100000,'VMQR',now()+interval '15 minutes',0)", payment, order);
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(user.id()));
        mvc.perform(get("/api/orders/" + order + "/payment").with(auth)).andExpect(status().isOk())
                .andExpect(jsonPath("$.qrUrl").value("https://vietqr.app/img?acc=123456789&bank=Vietcombank&amount=100000&des=VMQR"));
        mvc.perform(get("/api/orders/" + order + "/payment").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(outsider.id())))).andExpect(status().isNotFound());
        String template = "{\"id\":%d,\"gateway\":\"Vietcombank\",\"accountNumber\":\"123456789\",\"code\":\"VMQR\",\"transferType\":\"in\",\"transferAmount\":100000}";
        String timestamp = Long.toString(java.time.Instant.now().getEpochSecond());
        int id = 200;
        for (String body : List.of(template.formatted(id++).replace("100000", "90000"),
                template.formatted(id++).replace("100000", "110000"),
                template.formatted(id++).replace("123456789", "other-account"),
                template.formatted(id++).replace("\"in\"", "\"out\""))) {
            mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body)
                    .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, body)))
                    .andExpect(status().isOk());
        }
        jdbc.update("update payments set expires_at=now()-interval '1 minute' where id=?", payment);
        String late = template.formatted(300);
        mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(late)
                .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, late)))
                .andExpect(status().isOk());
        assertEquals("PENDING", jdbc.queryForObject("select status from payments where id=?", String.class, payment));
        assertEquals(5, jdbc.queryForObject("select count(*) from payment_webhook_events where processing_status='REJECTED'", Integer.class));
        assertEquals(0, jdbc.queryForObject("select count(*) from order_status_history", Integer.class));
    }

    @Test
    void accountEndpointsUseAuthenticatedActorAndAuditAddressWrites() throws Exception {
        var owner = users.login("owner", "owner@example.test", "Owner", null);
        var outsider = users.login("outsider", "outsider@example.test", "Outsider", null);
        importer.importDataset(dataset("Province", 1));
        var ownerAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(owner.id()));
        var outsiderAuth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(outsider.id()));
        mvc.perform(get("/api/me").with(ownerAuth)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(owner.id().toString()));
        mvc.perform(post("/api/addresses").with(ownerAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("""
                        {"recipientName":"Recipient","phone":"0901234567","wardCode":10,"addressLine":"Street","isDefault":true}
                        """)).andExpect(status().isCreated()).andExpect(jsonPath("$.provinceCode").value(1));
        var address = addresses.list(owner.id()).getFirst();
        assertEquals(owner.id(), jdbc.queryForObject("select created_by from addresses where id=?", UUID.class, address.id()));
        mvc.perform(get("/api/addresses").with(outsiderAuth)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/addresses/" + address.id()).with(outsiderAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("ADDRESS_NOT_FOUND"));
        mvc.perform(post("/api/addresses").with(ownerAuth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void cartPersistsPersonalizationFeesOwnershipAndAggregateStock() {
        var a = users.login("cart-a", "cart-a@example.test", "A", null);
        var b = users.login("cart-b", "cart-b@example.test", "B", null);
        jdbc.update("update products set stock=5 where id=?", PRODUCT);
        var engraving = new com.vanmoc.cart.dto.request.CartItemRequest.EngravingRequest("  An  ", "SCRIPT", com.vanmoc.product.enums.EngravingPosition.FRONT);
        var request = new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 2, engraving);
        var result = cart.add(a.id(), request);
        assertEquals("An", result.items().getFirst().engraving().text());
        assertEquals(0, result.total().compareTo(new java.math.BigDecimal("740000")));
        assertEquals(0, result.engravingTotal().compareTo(new java.math.BigDecimal("100000")));
        assertTrue(cart.get(b.id()).items().isEmpty());
        var id = result.items().getFirst().id();
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class, () -> cart.delete(b.id(), id));
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class, () -> cart.update(b.id(), id, new com.vanmoc.cart.dto.request.CartItemUpdateRequest(1, null)));
        assertEquals(1, cart.add(a.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, engraving)).items().size());
        var different = new com.vanmoc.cart.dto.request.CartItemRequest.EngravingRequest("Binh", engraving.font(), engraving.position());
        assertEquals(2, cart.add(a.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 2, different)).items().size());
        assertThrows(com.vanmoc.shared.exception.RuleException.class, () -> cart.add(a.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)));
        assertEquals(5, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
        cart.update(a.id(), id, new com.vanmoc.cart.dto.request.CartItemUpdateRequest(1, different));
        assertEquals(1, cart.get(a.id()).items().size());
        assertEquals(3, cart.get(a.id()).items().getFirst().quantity());
        cart.delete(a.id(), null);
        assertTrue(cart.get(a.id()).items().isEmpty());
    }

    @Test
    void invalidCartConfigurationNeverWritesItems() {
        var user = users.login("invalid-cart", "invalid-cart@example.test", "A", null);
        jdbc.update("update products set stock=10 where id=?", PRODUCT);
        for (String text : List.of("", "    ", "1234567890123", "Hello😀", "Line\nBreak")) {
            var config = new com.vanmoc.cart.dto.request.CartItemRequest.EngravingRequest(text, "SCRIPT", com.vanmoc.product.enums.EngravingPosition.FRONT);
            assertThrows(com.vanmoc.shared.exception.RuleException.class, () -> cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, config)));
        }
        var unsupported = new com.vanmoc.cart.dto.request.CartItemRequest.EngravingRequest("An", "HANDWRITING", com.vanmoc.product.enums.EngravingPosition.FRONT);
        assertThrows(com.vanmoc.shared.exception.RuleException.class, () -> cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, unsupported)));
        jdbc.update("update products set engraving_enabled=false where id=?", PRODUCT);
        assertThrows(com.vanmoc.shared.exception.RuleException.class, () -> cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, unsupported)));
        jdbc.update("update categories set active=false where id=?", CATEGORY);
        assertThrows(com.vanmoc.shared.exception.ResourceNotFoundException.class, () -> cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)));
        assertEquals(0, jdbc.queryForObject("select count(*) from cart_items", Integer.class));
    }

    @Test
    void concurrentCartAddsMergeWithoutLostUpdates() throws Exception {
        var user = users.login("concurrent-cart", "concurrent-cart@example.test", "A", null);
        jdbc.update("update products set stock=10 where id=?", PRODUCT);
        var start = new java.util.concurrent.CountDownLatch(1);
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var task = (java.util.concurrent.Callable<Void>) () -> {
                start.await();
                cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 2, null));
                return null;
            };
            var first = executor.submit(task); var second = executor.submit(task); start.countDown();
            first.get(15, java.util.concurrent.TimeUnit.SECONDS); second.get(15, java.util.concurrent.TimeUnit.SECONDS);
        }
        var result = cart.get(user.id());
        assertEquals(1, result.items().size());
        assertEquals(4, result.items().getFirst().quantity());
        assertEquals(PRODUCT.toString(), result.items().getFirst().productSlug());
        assertEquals(1, jdbc.queryForObject("select count(*) from carts where user_id=?", Integer.class, user.id()));
    }

    @Test
    void cartResponseIncludesProductSlugWithoutChangingUuidIdentity() {
        var user = users.login("cart-slug", "cart-slug@example.test", "Buyer", null);
        jdbc.update("update products set stock=2, slug='cart-link-slug' where id=?", PRODUCT);
        var row = cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)).items().getFirst();
        assertEquals(PRODUCT, row.productId());
        assertEquals("cart-link-slug", row.productSlug());
    }

    @Test
    void cartEndpointsValidateRequestsAndIgnoreClientPrices() throws Exception {
        var user = users.login("api-cart", "api-cart@example.test", "A", null);
        jdbc.update("update products set stock=10 where id=?", PRODUCT);
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(user.id()));
        mvc.perform(post("/api/cart/items").with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"productId\":\"" + PRODUCT + "\",\"quantity\":2,\"price\":1,\"engraving\":null}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(640000));
        mvc.perform(post("/api/cart/items").with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"productId\":\"" + PRODUCT + "\",\"quantity\":0,\"engraving\":null}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(post("/api/cart/items").with(auth).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        assertEquals(1, cart.get(user.id()).items().size());
    }

    @Test
    void addressAndCheckoutValidationMatrixRejectsWithoutWriting() throws Exception {
        var user = users.login("validation", "validation@example.test", "Buyer", null);
        importer.importDataset(dataset("Province", 1));
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(user.id()));
        String validAddress = "{\"recipientName\":\"Recipient\",\"phone\":\"0901234567\",\"wardCode\":10,\"addressLine\":\"Street\",\"isDefault\":true}";
        for (String body : List.of("{}", validAddress.replace("Recipient", " "),
                validAddress.replace("0901234567", "abcdefgh"), validAddress.replace("Street", " "),
                validAddress.replace("Recipient", "x".repeat(256)), validAddress.replace("Street", "x".repeat(2001)),
                validAddress.replace("\"wardCode\":10", "\"wardCode\":0"),
                validAddress.replace("\"isDefault\":true", "\"isDefault\":null"))) {
            mvc.perform(post("/api/addresses").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        assertEquals(0, jdbc.queryForObject("select count(*) from addresses", Integer.class));
        var address = addresses.save(user.id(), null, new com.vanmoc.user.dto.request.AddressRequest("Home", "Recipient", "0901234567", 10, "Street", true));
        jdbc.update("update products set stock=5 where id=?", PRODUCT);
        var row = cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)).items().getFirst();
        String valid = "{\"cartItemIds\":[\"" + row.id() + "\"],\"addressId\":\"" + address.id()
                + "\",\"paymentMethod\":\"COD\",\"idempotencyKey\":\"matrix-key\"}";
        for (String body : List.of("{}", valid.replace(row.id().toString(), "invalid-uuid"),
                valid.replace("[\"" + row.id() + "\"]", "[]"), valid.replace("[\"" + row.id() + "\"]", "[null]"),
                valid.replace("\"COD\"", "\"UNKNOWN\""), valid.replace("matrix-key", " "),
                valid.replace("matrix-key", "x".repeat(101)), valid.replace("\"paymentMethod\":\"COD\"", "\"paymentMethod\":null"))) {
            mvc.perform(post("/api/checkout").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/checkout").with(auth).contentType("application/json").content(valid)).andExpect(status().isForbidden());
        mvc.perform(post("/api/checkout").with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content(valid.replace("[\"" + row.id() + "\"]", "[\"" + row.id() + "\",\"" + row.id() + "\"]")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("DUPLICATE_CART_ITEM"));
        assertEquals(0, jdbc.queryForObject("select count(*) from orders", Integer.class));
        assertEquals(5, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
        assertEquals(1, cart.get(user.id()).items().size());
        mvc.perform(post("/api/checkout/preview").with(auth)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content(valid)).andExpect(status().isOk()).andExpect(jsonPath("$.grandTotal").value(350000));
        for (int retry = 0; retry < 2; retry++) {
            mvc.perform(post("/api/checkout").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(valid)).andExpect(status().isOk()).andExpect(jsonPath("$.grandTotal").value(350000));
        }
        assertEquals(1, jdbc.queryForObject("select count(*) from orders", Integer.class));
        assertEquals(4, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
    }

    @Test
    void simultaneousSameUserCheckoutRetriesCreateOnlyOneOrder() throws Exception {
        var user = users.login("retry-race", "retry-race@example.test", "Buyer", null);
        importer.importDataset(dataset("Province", 1));
        var address = addresses.save(user.id(), null, new com.vanmoc.user.dto.request.AddressRequest("Home", "Recipient", "0901234567", 10, "Street", true));
        jdbc.update("update products set stock=5 where id=?", PRODUCT);
        var row = cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 2, null)).items().getFirst();
        var request = new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()), address.id(), com.vanmoc.payment.enums.PaymentMethod.COD, null, "same-user-race");
        var start = new java.util.concurrent.CountDownLatch(1);
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<UUID> task = () -> { start.await(); return checkout.checkout(user.id(), request, true).orderId(); };
            var first = executor.submit(task); var second = executor.submit(task); start.countDown();
            assertEquals(first.get(15, java.util.concurrent.TimeUnit.SECONDS), second.get(15, java.util.concurrent.TimeUnit.SECONDS));
        }
        assertEquals(1, jdbc.queryForObject("select count(*) from orders", Integer.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from payments", Integer.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from stock_movements", Integer.class));
        assertEquals(3, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
    }

    @Test
    void webhookCancelAndExpiryRacesNeverPayAndRestoreStockTogether() throws Exception {
        var user = users.login("payment-race", "payment-race@example.test", "Buyer", null);
        importer.importDataset(dataset("Province", 1));
        var address = addresses.save(user.id(), null, new com.vanmoc.user.dto.request.AddressRequest("Home", "Recipient", "0901234567", 10, "Street", true));
        for (int attempt = 0; attempt < 8; attempt++) {
            jdbc.update("update products set stock=5 where id=?", PRODUCT);
            var row = cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)).items().getFirst();
            var order = checkout.checkout(user.id(), new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()), address.id(), com.vanmoc.payment.enums.PaymentMethod.BANK_TRANSFER, null, "payment-race-" + attempt), true);
            boolean expiry = attempt % 2 == 1;
            if (expiry) jdbc.update("update payments set expires_at=now()-interval '1 minute' where order_id=?", order.orderId());
            String body = "{\"id\":" + (8000 + attempt) + ",\"gateway\":\"Vietcombank\",\"accountNumber\":\"123456789\",\"code\":\"" + order.orderCode() + "\",\"transferType\":\"in\",\"transferAmount\":350000}";
            String timestamp = Long.toString(java.time.Instant.now().getEpochSecond());
            var start = new java.util.concurrent.CountDownLatch(1);
            try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
                var first = executor.submit(() -> { start.await(); mvc.perform(post("/api/payments/sepay/webhook").contentType("application/json").content(body)
                        .header("X-SePay-Timestamp", timestamp).header("X-SePay-Signature", webhookSignature(timestamp, body))).andExpect(status().isOk()); return null; });
                var second = executor.submit(() -> { start.await(); if (expiry) lifecycle.expire(order.orderId()); else {
                    try { lifecycle.cancel(user.id(), order.orderId()); } catch (com.vanmoc.shared.exception.RuleException exception) { assertEquals("ORDER_CANNOT_CANCEL", exception.getCode()); }
                } return null; });
                start.countDown(); first.get(15, java.util.concurrent.TimeUnit.SECONDS); second.get(15, java.util.concurrent.TimeUnit.SECONDS);
            }
            String state = jdbc.queryForObject("select status from payments where order_id=?", String.class, order.orderId());
            boolean paid = "PAID".equals(state);
            assertEquals(paid ? 4 : 5, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
            assertEquals(paid ? "PENDING_CONFIRMATION" : "CANCELLED", jdbc.queryForObject("select status from orders where id=?", String.class, order.orderId()));
            assertEquals(paid ? 1 : 2, jdbc.queryForObject("select count(*) from stock_movements where order_id=?", Integer.class, order.orderId()));
            lifecycle.expire(order.orderId());
            assertEquals(paid ? 4 : 5, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
        }
    }

    @Test
    void adminValidationMatrixRejectsInvalidProductStockAndTransitionFields() throws Exception {
        var admin = users.login("admin-validation", "admin-validation@example.test", "Admin", null);
        jdbc.update("update users set role='ADMIN' where id=?", admin.id());
        var auth = org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin()
                .oidcUser(com.vanmoc.user.service.OidcTestIdentity.principal(admin.id()));
        String valid = "{\"categoryId\":\"" + CATEGORY + "\",\"code\":\"VALIDATION-CODE\",\"slug\":\"validation-product\",\"name\":\"Valid name\",\"material\":\"Horn\",\"price\":100000,\"active\":true,\"engravingEnabled\":true,\"engravingMaxChars\":12,\"engravingFee\":10000,\"fonts\":[\"SCRIPT\"],\"positions\":[{\"position\":\"FRONT\",\"maxChars\":10}],\"version\":0}";
        int before = jdbc.queryForObject("select count(*) from products", Integer.class);
        for (String body : List.of("{}", valid.replace("VALIDATION-CODE", " "), valid.replace("Valid name", " "),
                valid.replace("Horn", " "), valid.replace("validation-product", "Invalid Slug"),
                valid.replace("\"price\":100000", "\"price\":-1"), valid.replace("\"price\":100000", "\"price\":0.5"),
                valid.replace("\"engravingFee\":10000", "\"engravingFee\":-1"),
                valid.replace("\"engravingMaxChars\":12", "\"engravingMaxChars\":0"),
                valid.replace("\"maxChars\":10", "\"maxChars\":256"), valid.replace("\"position\":\"FRONT\"", "\"position\":null"),
                valid.replace("\"SCRIPT\"", "null"), valid.replace("\"version\":0", "\"version\":null"), valid.replace("Valid name", "x".repeat(256)))) {
            mvc.perform(post("/api/admin/products").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        assertEquals(before, jdbc.queryForObject("select count(*) from products", Integer.class));
        for (String body : List.of("{}", "{\"delta\":1000001,\"note\":\"Reason\"}", "{\"delta\":-1000001,\"note\":\"Reason\"}",
                "{\"delta\":1,\"note\":\" \"}", "{\"delta\":1,\"note\":\"" + "x".repeat(2001) + "\"}")) {
            mvc.perform(post("/api/admin/products/" + PRODUCT + "/stock").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        assertEquals(0, jdbc.queryForObject("select count(*) from stock_movements", Integer.class));
        for (String body : List.of("{}", "{\"status\":null,\"collectCod\":false}", "{\"status\":\"UNKNOWN\",\"collectCod\":false}")) {
            mvc.perform(patch("/api/admin/orders/" + UUID.randomUUID() + "/status").with(auth)
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
    }

    @Test
    void checkoutDatabaseFailureRollsBackOrderPaymentStockAndCartDeletion() {
        var user = users.login("rollback", "rollback@example.test", "Buyer", null);
        importer.importDataset(dataset("Province", 1));
        var address = addresses.save(user.id(), null, new com.vanmoc.user.dto.request.AddressRequest("Home", "Recipient", "0901234567", 10, "Street", true));
        jdbc.update("update products set stock=5 where id=?", PRODUCT);
        var row = cart.add(user.id(), new com.vanmoc.cart.dto.request.CartItemRequest(PRODUCT, 1, null)).items().getFirst();
        var request = new com.vanmoc.order.dto.request.CheckoutRequest(List.of(row.id()), address.id(), com.vanmoc.payment.enums.PaymentMethod.COD, null, "rollback-key");
        // Fault injection is installed ONLY inside this Testcontainers database and always removed.
        jdbc.execute("create function fail_e2e_payment() returns trigger language plpgsql as $$ begin raise exception 'E2E injected payment failure'; end $$");
        jdbc.execute("create trigger fail_e2e_payment before insert on payments for each row execute function fail_e2e_payment()");
        try {
            assertThrows(org.springframework.dao.DataAccessException.class, () -> checkout.checkout(user.id(), request, true));
            for (String table : List.of("orders", "order_items", "payments", "stock_movements", "order_status_history"))
                assertEquals(0, jdbc.queryForObject("select count(*) from " + table, Integer.class), table);
            assertEquals(5, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
            assertEquals(1, cart.get(user.id()).items().size());
        } finally {
            jdbc.execute("drop trigger fail_e2e_payment on payments"); jdbc.execute("drop function fail_e2e_payment()");
        }
        assertNotNull(checkout.checkout(user.id(), request, true).orderId());
        assertEquals(4, jdbc.queryForObject("select stock from products where id=?", Integer.class, PRODUCT));
    }

    private LocationDataset dataset(String name, int wardProvince) {
        return new LocationDataset(List.of(new ProvinceData(1, name, "province", "province_one")),
                List.of(new WardData(10, wardProvince, "Ward", "ward", "ward_ten")));
    }

    @Test
    void stubbedInitializationBatchUpsertsAndPreservesOldRows() throws Exception {
        doReturn(dataset("First", 1)).when(source).fetch();
        assertTrue(initialization.execute(LocationInitializationService.Mode.IF_EMPTY).imported());
        importer.importDataset(new LocationDataset(List.of(new ProvinceData(2, "Old", "province", "old")), List.of()));
        doReturn(dataset("Updated", 1)).when(source).fetch();
        assertTrue(initialization.execute(LocationInitializationService.Mode.REFRESH).imported());
        assertEquals("Updated", jdbc.queryForObject("select name from provinces where code=1", String.class));
        assertEquals(2, jdbc.queryForObject("select count(*) from provinces", Integer.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from wards", Integer.class));
        clearInvocations(source);
        assertFalse(initialization.execute(LocationInitializationService.Mode.IF_EMPTY).imported());
        verifyNoInteractions(source);
        mvc.perform(get("/api/provinces")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/provinces/1/wards")).andExpect(status().isOk()).andExpect(jsonPath("$[0].code").value(10));
        mvc.perform(get("/api/provinces/2/wards")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void wardFailureRollsBackProvinceInsertAndUpdate() {
        importer.importDataset(dataset("Original", 1));
        var broken = new LocationDataset(List.of(new ProvinceData(1, "Changed", "province", "province_one"),
                new ProvinceData(2, "New", "province", "new")),
                List.of(new WardData(11, 999, "Bad", "ward", "bad")));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () -> importer.importDataset(broken));
        assertEquals("Original", jdbc.queryForObject("select name from provinces where code=1", String.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from provinces", Integer.class));
        assertEquals(1, jdbc.queryForObject("select count(*) from wards", Integer.class));
    }

    @Test
    void importCrossesBatchBoundariesAndRollsBackEarlierBatches() {
        var provinces = java.util.stream.IntStream.rangeClosed(1, 101)
                .mapToObj(i -> new ProvinceData(i, "Province " + i, "province", "province_" + i)).toList();
        var wards = java.util.stream.IntStream.rangeClosed(1, 501)
                .mapToObj(i -> new WardData(i, (i % 101) + 1, "Ward " + i, "ward", "ward_" + i)).toList();
        importer.importDataset(new LocationDataset(provinces, wards));
        assertEquals(101, jdbc.queryForObject("select count(*) from provinces", Integer.class));
        assertEquals(501, jdbc.queryForObject("select count(*) from wards", Integer.class));
        var changedProvinces = provinces.stream().map(p ->
                new ProvinceData(p.code(), "Changed", p.divisionType(), p.codename())).toList();
        var brokenWards = new java.util.ArrayList<>(wards.stream().map(w ->
                new WardData(w.code(), w.provinceCode(), "Changed", w.divisionType(), w.codename())).toList());
        brokenWards.set(500, new WardData(501, 999, "Invalid", "ward", "invalid"));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,
                () -> importer.importDataset(new LocationDataset(changedProvinces, brokenWards)));
        assertEquals("Province 1", jdbc.queryForObject("select name from provinces where code=1", String.class));
        assertEquals("Ward 1", jdbc.queryForObject("select name from wards where code=1", String.class));
        assertEquals("Ward 501", jdbc.queryForObject("select name from wards where code=501", String.class));
    }

    @Test
    void publicApiAndCorsRunThroughSecurityFilters() throws Exception {
        mvc.perform(get("/api/categories")).andExpect(status().isOk());
        mvc.perform(get("/api/products").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mvc.perform(get("/api/products/" + PRODUCT)).andExpect(status().isOk());
        jdbc.update("update products set active=false where id=?", FALLBACK);
        mvc.perform(get("/api/products/" + FALLBACK)).andExpect(status().isNotFound());
        jdbc.update("update categories set active=false where id=?", CATEGORY);
        mvc.perform(get("/api/products/" + PRODUCT)).andExpect(status().isNotFound());
        mvc.perform(options("/api/products").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET").header("Access-Control-Request-Headers", "Accept-Language"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE"));
        mvc.perform(get("/api/products").header("Origin", "https://untrusted.example")).andExpect(status().isForbidden());
        mvc.perform(options("/api/products").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "PUT")).andExpect(status().isForbidden());
        mvc.perform(get("/api/cart")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/products")).andExpect(status().isForbidden());
        mvc.perform(get("/api/products?size=101")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/products?categoryId=invalid")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/" + UUID.randomUUID()).header("Accept-Language", "en"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
                .andExpect(jsonPath("$.title").value("Resource Not Found"));
        mvc.perform(get("/api/products/invalid")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
        mvc.perform(get("/api/provinces/999/wards").header("Accept-Language", "vi"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("PROVINCE_NOT_FOUND"))
                .andExpect(jsonPath("$.title").value("Không tìm thấy tài nguyên"));
    }
}
