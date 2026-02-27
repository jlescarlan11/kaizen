package com.kaizen.backend.health;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ProbeControllerUnitTest {

    private final ProbeController probeController = new ProbeController();

    @Test
    void probeReturnsOkStatus() {
        ProbeResponse response = probeController.probe();
        assertEquals("ok", response.status());
    }
}
