package com.vanmoc.payment.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class SePayWebhookServiceTest {
    @Test
    void extractsCodeFromBankContentWhenProviderCodeIsMissing() {
        assertEquals("VMF8643704", SePayWebhookService.transferCode(null,
                "CT DEN:342T26A0DHQYHRQL MBVCB.16440907953.760373.SEVQR VMF8643704.CT tu account"));
        assertEquals("VMF8643704", SePayWebhookService.transferCode("", "SEVQR VMF8643704"));
    }

    @Test
    void preservesExplicitProviderCode() {
        assertEquals("VM1234ABCD", SePayWebhookService.transferCode("VM1234ABCD", "SEVQR VMF8643704"));
    }

    @Test
    void rejectsAmbiguousOrMalformedContent() {
        assertEquals("", SePayWebhookService.transferCode(null, "SEVQR VM1234ABCD SEVQR VMF8643704"));
        assertEquals("", SePayWebhookService.transferCode(null, "SEVQR VMF86437040"));
        assertEquals("", SePayWebhookService.transferCode(null, "VMF8643704"));
        assertEquals("", SePayWebhookService.transferCode(null, null));
    }
}
