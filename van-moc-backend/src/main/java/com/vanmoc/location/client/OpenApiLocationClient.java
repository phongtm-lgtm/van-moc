package com.vanmoc.location.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vanmoc.location.dto.importdata.LocationDataset;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

@Component
public class OpenApiLocationClient {
    private final RestClient client;
    private final String provincesUrl;
    private final String wardsUrl;

    public OpenApiLocationClient(RestClient.Builder builder,
            @Value("${app.location.provinces-url}") String provincesUrl,
            @Value("${app.location.wards-url}") String wardsUrl,
            @Value("${app.location.connect-timeout-ms}") long connectTimeout,
            @Value("${app.location.read-timeout-ms}") long readTimeout) {
        if (connectTimeout <= 0 || readTimeout <= 0) {
            throw new IllegalArgumentException("Location API timeouts must be positive");
        }
        var httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(connectTimeout)).build();
        var factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofMillis(readTimeout));
        this.client = builder.requestFactory(factory).build();
        this.provincesUrl = provincesUrl;
        this.wardsUrl = wardsUrl;
    }

    public LocationDataset fetch() {
        List<ProvinceData> provinces = client.get().uri(provincesUrl).retrieve()
                .body(new ParameterizedTypeReference<>() {});
        List<WardData> wards = client.get().uri(wardsUrl).retrieve()
                .body(new ParameterizedTypeReference<>() {});
        if (provinces == null || wards == null || provinces.isEmpty() || wards.isEmpty()) {
            throw new IllegalStateException("Location API returned no provinces or wards");
        }
        return new LocationDataset(provinces.stream().map(p ->
                new com.vanmoc.location.dto.importdata.ProvinceData(p.code(), p.name(), p.divisionType(), p.codename())).toList(),
                wards.stream().map(w -> new com.vanmoc.location.dto.importdata.WardData(w.code(), w.provinceCode(), w.name(),
                        w.divisionType(), w.codename())).toList());
    }

    private record ProvinceData(Integer code, String name,
            @JsonProperty("division_type") String divisionType, String codename) {}
    private record WardData(Integer code, String name,
            @JsonProperty("division_type") String divisionType, String codename,
            @JsonProperty("province_code") Integer provinceCode) {}
}
