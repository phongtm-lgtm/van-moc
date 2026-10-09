package com.vanmoc.location.client;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class OpenApiLocationClientTest {
    @Test
    void mapsSnakeCaseFromLocalHttpStub() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/p/", exchange -> {
            var bytes = """
                    [{"code":1,"name":"Hà Nội","division_type":"thành phố","codename":"ha_noi"}]
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (var body = exchange.getResponseBody()) { body.write(bytes); }
        });
        server.createContext("/w/", exchange -> {
            var bytes = """
                    [{"code":10,"province_code":1,"name":"Phường mẫu","division_type":"phường","codename":"phuong_mau"}]
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (var body = exchange.getResponseBody()) { body.write(bytes); }
        });
        server.start();
        try {
            var base = "http://127.0.0.1:" + server.getAddress().getPort();
            var client = new OpenApiLocationClient(RestClient.builder(), base + "/p/", base + "/w/", 2000, 2000);
            var data = client.fetch();
            assertEquals("Hà Nội", data.provinces().getFirst().name());
            assertEquals("thành phố", data.provinces().getFirst().divisionType());
            assertEquals(1, data.wards().getFirst().provinceCode());
            assertEquals("phường", data.wards().getFirst().divisionType());
        } finally {
            server.stop(0);
        }
    }

    @Test
    void rejectsNonPositiveTimeouts() {
        assertThrows(IllegalArgumentException.class, () ->
                new OpenApiLocationClient(RestClient.builder(), "unused", "unused", 0, 1000));
        assertThrows(IllegalArgumentException.class, () ->
                new OpenApiLocationClient(RestClient.builder(), "unused", "unused", 1000, -1));
    }
}
