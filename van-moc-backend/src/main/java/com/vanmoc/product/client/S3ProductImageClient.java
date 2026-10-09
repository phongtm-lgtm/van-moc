package com.vanmoc.product.client;

import com.vanmoc.shared.config.AwsProperties;
import com.vanmoc.shared.exception.RuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import java.io.IOException;
import java.util.UUID;
import java.util.List;

@Component
public class S3ProductImageClient {
    public record UploadedImage(String storageKey, String imageUrl) {}

    private static final Logger log = LoggerFactory.getLogger(S3ProductImageClient.class);
    private final S3Client s3;
    private final AwsProperties properties;

    public S3ProductImageClient(S3Client s3, AwsProperties properties) {
        this.s3 = s3;
        this.properties = properties;
    }

    public UploadedImage upload(MultipartFile file) {
        if (properties.s3().bucket().isBlank() || properties.cloudfront().url().isBlank()
                || properties.accessKey().isBlank() || properties.secretKey().isBlank()) {
            throw new RuleException("PRODUCT_IMAGE_UPLOAD_FAILED", HttpStatus.SERVICE_UNAVAILABLE);
        }
        var key = UUID.randomUUID().toString();
        try (var stream = file.getInputStream()) {
            var request = PutObjectRequest.builder()
                    .bucket(properties.s3().bucket())
                    .key(key)
                    .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                    .build();
            s3.putObject(request, RequestBody.fromInputStream(stream, file.getSize()));
            return new UploadedImage(key, properties.cloudfront().url().replaceAll("/+$", "") + "/" + key);
        } catch (IOException | SdkException | IllegalArgumentException exception) {
            log.warn("Product image upload failed: {}", exception.getClass().getSimpleName());
            var failure = new RuleException("PRODUCT_IMAGE_UPLOAD_FAILED", HttpStatus.BAD_GATEWAY);
            failure.initCause(exception);
            throw failure;
        }
    }

    public void delete(List<String> keys) {
        for (var key : keys) {
            try {
                s3.deleteObject(DeleteObjectRequest.builder().bucket(properties.s3().bucket()).key(key).build());
            } catch (SdkException exception) {
                // A failed cleanup cannot undo the committed product deletion. Retain the key in logs for recovery.
                log.warn("Unable to remove S3 object after product deletion: {} ({})", key, exception.getClass().getSimpleName());
            }
        }
    }
}
