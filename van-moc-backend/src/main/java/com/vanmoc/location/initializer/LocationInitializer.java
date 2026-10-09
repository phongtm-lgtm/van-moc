package com.vanmoc.location.initializer;

import com.vanmoc.location.service.LocationInitializationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class LocationInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(LocationInitializer.class);
    private final LocationInitializationService service;
    private final LocationInitializationService.Mode mode;

    public LocationInitializer(LocationInitializationService service,
            @Value("${app.location.init-mode}") LocationInitializationService.Mode mode) {
        this.service = service;
        this.mode = mode;
    }

    @Override
    public void run(ApplicationArguments args) {
        var result = service.execute(mode);
        if (result.imported()) {
            log.info("Imported locations: {} provinces, {} wards", result.provinceCount(), result.wardCount());
        } else {
            log.info("Location import skipped (mode: {})", mode);
        }
    }
}
