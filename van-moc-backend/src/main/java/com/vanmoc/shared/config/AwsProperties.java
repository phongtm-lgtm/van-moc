package com.vanmoc.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws")
public record AwsProperties(String accessKey, String secretKey, S3 s3, Cloudfront cloudfront) {
    public record S3(String bucket, String region) {}
    public record Cloudfront(String url) {}
}
