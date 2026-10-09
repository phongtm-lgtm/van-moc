package com.vanmoc.shared.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(AwsProperties.class)
public class AwsConfig {
    @Bean
    S3Client s3Client(AwsProperties properties) {
        return S3Client.builder()
                .region(Region.of(properties.s3().region()))
                .credentialsProvider(() -> AwsBasicCredentials.create(properties.accessKey(), properties.secretKey()))
                .build();
    }
}
