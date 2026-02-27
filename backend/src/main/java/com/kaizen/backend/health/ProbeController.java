package com.kaizen.backend.health;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProbeController {

    @GetMapping("/probe")
    public Map<String, String> probe() {
        return Map.of("status", "ok");
    }
}
