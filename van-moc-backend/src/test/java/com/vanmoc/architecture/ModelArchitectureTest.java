package com.vanmoc.architecture;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;

class ModelArchitectureTest {

    @Test
    void obsoleteCleanArchitecturePackagesMustNotRemain() throws IOException {
        try (var paths = Files.walk(Path.of("src/main/java/com/vanmoc"))) {
            for (Path path : paths.filter(p -> p.toString().endsWith(".java"))
                    .toList()) {
                String source = Files.readString(path);
                for (String forbidden : new String[]{".domain.model", ".domain.repository", ".application.",
                        ".infrastructure.", ".presentation."}) {
                    assertFalse(source.lines().filter(line -> line.startsWith("package ")
                            || line.startsWith("import com.vanmoc.")).anyMatch(line -> line.contains(forbidden)),
                            path + " depends on " + forbidden);
                }
            }
        }
    }

    @Test
    void persistenceMustNotDeclareInputValidationConstraints() throws IOException {
        try (var paths = Files.walk(Path.of("src/main/java/com/vanmoc"))) {
            for (Path path : paths.filter(p -> p.toString().endsWith(".java"))
                    .filter(p -> p.toString().replace('\\', '/').contains("/entity/")
                            || p.toString().replace('\\', '/').contains("/persistence/")).toList()) {
                String source = Files.readString(path);
                assertFalse(source.matches("(?s).*\\b(?:length|nullable|optional)\\s*=.*"), path.toString());
                assertFalse(source.contains("jakarta.validation"), path.toString());
            }
        }
    }
}
